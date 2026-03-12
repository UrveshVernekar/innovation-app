import { getDbConnection } from "@/lib/db"
import { RowDataPacket } from "mysql2"
import { DashboardStats } from "@/types/dashboard"

interface CountRow extends RowDataPacket {
    count: number
}

interface SumRow extends RowDataPacket {
    totalPoints: number
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