import { getDbConnection } from "./db";

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

export async function createInnovation(data: CreateInnovationParams) {
    const db = await getDbConnection("innovation");

    try {
        // await db.query(
        //     `
        //         INSERT INTO innovation_ideas (
        //             company_id, factory_id, department_id, submitted_by, workflow_id,
        //             title, description, expected_benefit, category, status
        //         )
        //         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED')
        //     `,
        //     [
        //         data.companyId,
        //         data.factoryId,
        //         // 50, // TEMP DEPARTMENT
        //         data.departmentId,
        //         data.userId,
        //         1, // TEMP WORKFLOW
        //         data.title,
        //         data.description,
        //         data.expected_benefit,
        //         data.category,
        //     ]
        // );
        await db.query(
            `
                CALL initiate_innovation(?, ?, ?, ?, ?, ?, ?, ?, ?);
            `,
            [data.companyId, data.factoryId, data.departmentId, data.userId, 1, data.title, data.description, data.expected_benefit, data.category, 'PENDING']
        );
    } finally {
        await db.end();
    }
}