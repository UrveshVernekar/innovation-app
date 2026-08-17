import { getDbConnection } from "./db";
import { RowDataPacket } from "mysql2";

interface ApprovalRow extends RowDataPacket {
    idea_id: number;
    title: string;
    submitted_by: number;
    name: string;
    stage_name: string;
    created_at: Date;
}

interface IdeaRow extends RowDataPacket {
    id: number;
    title: string;
    description: string;
    expected_benefit: string;
    status: string;
    category?: string;
    department?: string;
    factory?: string;
    current_stage?: number;
    submitted_by_name?: string;
    submitted_by_email?: string;
    created_at: Date;
}

export interface WorkflowStageDetail extends RowDataPacket {
    workflow_stage_id: number;
    stage_name: string;
    status: string;
    stage_order: number;
    points_on_approval?: number;
    approver_id?: number;
    approver_name?: string;
    comments?: string;
    actioned_at?: Date | string;
}

export async function getPendingApprovals(userId: number) {
    const db = await getDbConnection("innovation");

    try {
        const [rows] = await db.query<ApprovalRow[]>(
            `
                SELECT
                    ii.id AS idea_id,
                    ii.title,
                    ii.submitted_by,
                    CONCAT(vup.first_name, ' ', vup.last_name) AS name,
                    aws.stage_name,
                    ii.created_at
                FROM innovation_approval_transactions iat
                JOIN innovation_ideas ii
                    ON ii.id = iat.idea_id
                JOIN innovation_approval_workflow_stages aws
                    ON aws.id = iat.workflow_stage_id
                JOIN org_db.vw_user_profiles vup
                    ON vup.user_id = ii.submitted_by
                WHERE
                    iat.approver_id = ?
                    AND iat.status = 'PENDING'
                ORDER BY ii.created_at DESC
            `,
            [userId]
        );

        return rows;
    } finally {
        await db.end();
    }
}

export async function processApproval({
    ideaId,
    approverId,
    action,
    comments,
}: {
    ideaId: number
    approverId: number
    action: string
    comments: string
}) {
    const db = await getDbConnection("innovation");

    try {
        await db.query(
            `
                CALL process_innovation_stage_action(?, ?, ?, ?)
            `,
            [
                ideaId,
                approverId,
                action,
                comments
            ]
        );
    } finally {
        await db.end();
    }
};

export async function getIdeaDetails(ideaId: number) {
    const db = await getDbConnection("innovation");

    try {

        const [ideaRows] = await db.query<IdeaRow[]>(
            `
            SELECT
                ii.id,
                ii.title,
                ii.description,
                ii.expected_benefit,
                ii.category,
                ii.status,
                ii.current_stage_id AS current_stage,
                CONCAT(ud.first_name,' ',ud.last_name) AS submitted_by_name,
                ud.email AS submitted_by_email,
                dm.dept_name AS department,
                fm.factory_name AS factory,
                ii.created_at
            FROM innovation_ideas ii
            LEFT JOIN org_db.user_details ud
                ON ud.user_id = ii.submitted_by
            LEFT JOIN org_db.department_master dm
                ON dm.id = ii.department_id
            LEFT JOIN org_db.factory_master fm
                ON fm.id = ii.factory_id
            WHERE ii.id = ?
            `,
            [ideaId]
        );

        const idea = ideaRows[0];
        if (!idea) return null;

        const [workflowRows] = await db.query<WorkflowStageDetail[]>(
            `
            SELECT
                aws.id AS workflow_stage_id,
                aws.stage_name,
                aws.stage_order,
                aws.points_on_approval,
                iat.status,
                iat.approver_id,
                iat.comments,
                iat.actioned_at,
                CONCAT(ud.first_name, ' ', ud.last_name) AS approver_name
            FROM innovation_approval_transactions iat
            JOIN innovation_approval_workflow_stages aws
                ON aws.id = iat.workflow_stage_id
            LEFT JOIN org_db.user_details ud
                ON ud.user_id = iat.approver_id
            WHERE iat.idea_id = ?
            ORDER BY aws.stage_order
            `,
            [ideaId]
        );

        return {
            ...idea,
            workflow: workflowRows
        };

    } finally {
        await db.end();
    }
}