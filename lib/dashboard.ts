import { getDbConnection } from "@/lib/db"
import { RowDataPacket } from "mysql2"
import { DashboardStats } from "@/types/dashboard"

interface CountRow extends RowDataPacket {
    count: number
}

interface SumRow extends RowDataPacket {
    totalPoints: number
}

export interface ChartDataRow extends RowDataPacket {
    month: string;
    submitted: number;
    approved: number;
}

export interface CategoryBreakdownRow extends RowDataPacket {
    name: string;
    value: number;
}

export interface TopContributorRow extends RowDataPacket {
    userId: number;
    fullName: string;
    points: number;
}

export interface RecentIdeaRow extends RowDataPacket {
    id: number;
    title: string;
    category: string | null;
    status: string;
    createdAt: string;
}

export async function getUserDashboardStats(
    userId: number
): Promise<DashboardStats> {
    const db = await getDbConnection("innovation")

    try {
        const [totalRows] = await db.query<CountRow[]>(
            `SELECT COUNT(*) AS count
       FROM innovation_ideas
       WHERE submitted_by = ?`,
            [userId]
        )
        const totalIdeas = totalRows[0]?.count ?? 0

        const [pendingRows] = await db.query<CountRow[]>(
            `SELECT COUNT(*) AS count
       FROM innovation_ideas
       WHERE submitted_by = ?
       AND status IN ('SUBMITTED','IN_PROGRESS')`,
            [userId]
        )
        const pendingIdeas = pendingRows[0]?.count ?? 0

        const [approvedRows] = await db.query<CountRow[]>(
            `SELECT COUNT(*) AS count
       FROM innovation_ideas
       WHERE submitted_by = ?
       AND status = 'APPROVED'`,
            [userId]
        )
        const approvedIdeas = approvedRows[0]?.count ?? 0

        const [pointsRows] = await db.query<SumRow[]>(
            `SELECT COALESCE(SUM(points),0) AS totalPoints
       FROM innovation_points_ledger
       WHERE user_id = ?`,
            [userId]
        )
        const totalPoints = pointsRows[0]?.totalPoints ?? 0

        return {
            totalIdeas,
            pendingIdeas,
            approvedIdeas,
            totalPoints,
        }
    } finally {
        await db.end()
    }
}

export async function getDashboardChartData(
    userId: number
): Promise<ChartDataRow[]> {
    const db = await getDbConnection("innovation");
    try {
        const query = `
            SELECT 
                DATE_FORMAT(created_at, '%b %Y') AS month,
                CAST(COUNT(*) AS SIGNED) AS submitted,
                CAST(SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS SIGNED) AS approved
            FROM innovation_ideas
            WHERE submitted_by = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%b %Y'), YEAR(created_at), MONTH(created_at)
            ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC;
        `;
        const [rows] = await db.query<ChartDataRow[]>(query, [userId]);
        return rows;
    } finally {
        await db.end();
    }
}

export async function getCategoryBreakdown(
    userId: number
): Promise<CategoryBreakdownRow[]> {
    const db = await getDbConnection("innovation");
    try {
        const query = `
            SELECT 
                COALESCE(category, 'General') AS name,
                CAST(COUNT(*) AS SIGNED) AS value
            FROM innovation_ideas
            WHERE submitted_by = ?
            GROUP BY category;
        `;
        const [rows] = await db.query<CategoryBreakdownRow[]>(query, [userId]);
        return rows;
    } finally {
        await db.end();
    }
}

export async function getDashboardTopContributors(): Promise<TopContributorRow[]> {
    const db = await getDbConnection("innovation");
    try {
        const query = `
            SELECT 
                pl.user_id AS userId,
                CONCAT(ud.first_name, ' ', ud.last_name) AS fullName,
                CAST(COALESCE(SUM(pl.points), 0) AS SIGNED) AS points
            FROM innovation_points_ledger pl
            JOIN org_db.user_master um ON pl.user_id = um.id
            JOIN org_db.user_details ud ON um.id = ud.user_id
            GROUP BY pl.user_id, ud.first_name, ud.last_name
            ORDER BY points DESC
            LIMIT 5;
        `;
        const [rows] = await db.query<TopContributorRow[]>(query);
        return rows;
    } finally {
        await db.end();
    }
}

export async function getDashboardRecentIdeas(
    userId: number
): Promise<RecentIdeaRow[]> {
    const db = await getDbConnection("innovation");
    try {
        const query = `
            SELECT 
                id,
                title,
                category,
                status,
                DATE_FORMAT(created_at, '%Y-%m-%d') AS createdAt
            FROM innovation_ideas
            WHERE submitted_by = ?
            ORDER BY created_at DESC
            LIMIT 4;
        `;
        const [rows] = await db.query<RecentIdeaRow[]>(query, [userId]);
        return rows;
    } finally {
        await db.end();
    }
}