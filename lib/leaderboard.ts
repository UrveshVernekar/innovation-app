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

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
    const db = await getDbConnection("innovation");

    try {
        const query = `
            SELECT 
                pl.user_id AS userId,
                CONCAT(ud.first_name, ' ', ud.last_name) AS fullName,
                fm.factory_name AS factoryName,
                dm.dept_name AS departmentName,
                CAST(COALESCE(SUM(pl.points), 0) AS SIGNED) AS totalPoints,
                CAST((SELECT COUNT(*) FROM innovation_ideas WHERE submitted_by = pl.user_id) AS SIGNED) AS totalIdeas,
                CAST((SELECT COUNT(*) FROM innovation_ideas WHERE submitted_by = pl.user_id AND status = 'APPROVED') AS SIGNED) AS approvedIdeas
            FROM innovation_points_ledger pl
            JOIN org_db.user_master um ON pl.user_id = um.id
            JOIN org_db.user_details ud ON um.id = ud.user_id
            JOIN org_db.factory_master fm ON um.factory_id = fm.id
            LEFT JOIN org_db.user_department_map udm ON udm.user_id = um.id
            LEFT JOIN org_db.department_master dm ON dm.id = udm.department_id
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
