import { getDbConnection } from "./db";
import { RowDataPacket } from "mysql2";

interface CreateInnovationParams {
    title: string
    description: string
    expected_benefit?: string
    category?: string
    userId: number
    factoryId: number
    companyId: number
    departmentId: number
}

interface InnovationRow extends RowDataPacket {
    idea_id: number;
    title: string;
    submitted_by: number;
    stage_name: string;
    created_at: Date;
}

export async function createInnovation(data: CreateInnovationParams): Promise<number> {
    const db = await getDbConnection("innovation");

    try {
        const [resultSets] = await db.query<any[]>(
            `
                CALL initiate_innovation(?, ?, ?, ?, ?, ?, ?, ?, ?);
            `,
            [data.companyId, data.factoryId, data.departmentId, data.userId, 1, data.title, data.description, data.expected_benefit, data.category]
        );
        // The first result set from stored procedure contains SELECT v_idea_id AS idea_id
        const firstSet = Array.isArray(resultSets) ? resultSets[0] : null;
        const ideaId = firstSet && firstSet[0] ? firstSet[0].idea_id : 0;
        return ideaId;
    } finally {
        await db.end();
    }
}

export async function getUserInnovations(userId: number) {
    const db = await getDbConnection("innovation");

    try {
        const [rows] = await db.query<InnovationRow[]>(
            `
                SELECT
                    ii.id AS idea_id,
                    ii.title,
                    ii.submitted_by,
                    aws.stage_name,
                    ii.created_at
                FROM innovation_ideas ii
                JOIN innovation_approval_workflow_stages aws
                    ON ii.current_stage_id = aws.id
                WHERE submitted_by = ?
                ORDER BY ii.id DESC;
            `,
            [userId]
        );

        return rows;
    } finally {
        await db.end();
    }
}