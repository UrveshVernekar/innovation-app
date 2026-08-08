import { getDbConnection } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface LeaderboardUser extends RowDataPacket {
    userId: number;
    fullName: string;
    factoryName: string;
    departmentName: string;
    totalPoints: number;
    totalIdeas: number;
    approvedIdeas: number;
}

export interface PointsHistoryEntry extends RowDataPacket {
    id: number;
    eventType: string;
    points: number;
    createdAt: string;
    ideaTitle: string;
    stageName: string | null;
}

export interface IdeaHistoryEntry extends RowDataPacket {
    id: number;
    title: string;
    category: string | null;
    status: string;
    createdAt: string;
}

export async function getLeaderboard(range: "month" | "quarter" | "all" = "all"): Promise<LeaderboardUser[]> {
    const db = await getDbConnection("innovation");

    try {
        let pointsWhereClause = "";
        let ideasWhereClause = "";
        let approvedIdeasWhereClause = "";

        if (range === "month") {
            pointsWhereClause = "AND pl.created_at >= DATE_FORMAT(NOW(), '%Y-%m-01 00:00:00')";
            ideasWhereClause = "AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01 00:00:00')";
            approvedIdeasWhereClause = "AND status = 'APPROVED' AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01 00:00:00')";
        } else if (range === "quarter") {
            pointsWhereClause = "AND pl.created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL (MONTH(NOW())-1)%3 MONTH), '%Y-%m-01 00:00:00')";
            ideasWhereClause = "AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL (MONTH(NOW())-1)%3 MONTH), '%Y-%m-01 00:00:00')";
            approvedIdeasWhereClause = "AND status = 'APPROVED' AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL (MONTH(NOW())-1)%3 MONTH), '%Y-%m-01 00:00:00')";
        } else {
            approvedIdeasWhereClause = "AND status = 'APPROVED'";
        }

        const query = `
            SELECT 
                pl.user_id AS userId,
                CONCAT(ud.first_name, ' ', ud.last_name) AS fullName,
                fm.factory_name AS factoryName,
                dm.dept_name AS departmentName,
                CAST(COALESCE(SUM(pl.points), 0) AS SIGNED) AS totalPoints,
                CAST((SELECT COUNT(*) FROM innovation_ideas WHERE submitted_by = pl.user_id ${ideasWhereClause}) AS SIGNED) AS totalIdeas,
                CAST((SELECT COUNT(*) FROM innovation_ideas WHERE submitted_by = pl.user_id ${approvedIdeasWhereClause}) AS SIGNED) AS approvedIdeas
            FROM innovation_points_ledger pl
            JOIN org_db.user_master um ON pl.user_id = um.id
            JOIN org_db.user_details ud ON um.id = ud.user_id
            JOIN org_db.factory_master fm ON um.factory_id = fm.id
            LEFT JOIN org_db.user_department_map udm ON udm.user_id = um.id
            LEFT JOIN org_db.department_master dm ON dm.id = udm.department_id
            WHERE 1=1 ${pointsWhereClause}
            GROUP BY pl.user_id, ud.first_name, ud.last_name, fm.factory_name, dm.dept_name
            ORDER BY totalPoints DESC
            LIMIT 100;
        `;

        const [rows] = await db.query<LeaderboardUser[]>(query);
        return rows;
    } finally {
        await db.end();
    }
}

export async function getUserLeaderboardDetails(userId: number): Promise<{
    pointsHistory: PointsHistoryEntry[];
    ideasHistory: IdeaHistoryEntry[];
}> {
    const db = await getDbConnection("innovation");

    try {
        // Query points history
        const pointsQuery = `
            SELECT 
                pl.id,
                pl.event_type AS eventType,
                pl.points,
                DATE_FORMAT(pl.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt,
                ii.title AS ideaTitle,
                aws.stage_name AS stageName
            FROM innovation_points_ledger pl
            JOIN innovation_ideas ii ON pl.idea_id = ii.id
            LEFT JOIN innovation_approval_workflow_stages aws ON pl.workflow_stage_id = aws.id
            WHERE pl.user_id = ?
            ORDER BY pl.created_at DESC;
        `;

        // Query ideas history
        const ideasQuery = `
            SELECT 
                id,
                title,
                category,
                status,
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
            FROM innovation_ideas
            WHERE submitted_by = ?
            ORDER BY created_at DESC
            LIMIT 15;
        `;

        const [pointsRows] = await db.query<PointsHistoryEntry[]>(pointsQuery, [userId]);
        const [ideasRows] = await db.query<IdeaHistoryEntry[]>(ideasQuery, [userId]);

        return {
            pointsHistory: pointsRows,
            ideasHistory: ideasRows
        };
    } finally {
        await db.end();
    }
}
