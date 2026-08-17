import { getDbConnection } from "./db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface AttachmentRecord {
    id: number;
    idea_id: number;
    uploaded_by: number;
    file_name: string;
    file_path: string;
    uploaded_at: Date;
    uploader_name?: string;
}

interface AttachmentRow extends RowDataPacket, AttachmentRecord {}

export async function addAttachment(data: {
    ideaId: number;
    uploadedBy: number;
    fileName: string;
    filePath: string;
}): Promise<number> {
    const db = await getDbConnection("innovation");
    try {
        const [result] = await db.query<ResultSetHeader>(
            `
            INSERT INTO innovation_attachments (idea_id, uploaded_by, file_name, file_path)
            VALUES (?, ?, ?, ?);
            `,
            [data.ideaId, data.uploadedBy, data.fileName, data.filePath]
        );
        return result.insertId;
    } finally {
        await db.end();
    }
}

export async function getAttachmentsByIdea(ideaId: number): Promise<AttachmentRecord[]> {
    const db = await getDbConnection("innovation");
    try {
        const [rows] = await db.query<AttachmentRow[]>(
            `
            SELECT 
                att.id,
                att.idea_id,
                att.uploaded_by,
                att.file_name,
                att.file_path,
                att.uploaded_at,
                CONCAT_WS(' ', ud.first_name, ud.last_name) AS uploader_name
            FROM innovation_attachments att
            LEFT JOIN org_db.user_details ud ON att.uploaded_by = ud.user_id
            WHERE att.idea_id = ?
            ORDER BY att.uploaded_at DESC;
            `,
            [ideaId]
        );
        return rows;
    } finally {
        await db.end();
    }
}

export async function getAttachmentCount(ideaId: number): Promise<number> {
    const db = await getDbConnection("innovation");
    try {
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT COUNT(*) as count FROM innovation_attachments WHERE idea_id = ?`,
            [ideaId]
        );
        return rows[0]?.count ?? 0;
    } finally {
        await db.end();
    }
}

export async function deleteAttachment(attachmentId: number, userId: number): Promise<AttachmentRecord | null> {
    const db = await getDbConnection("innovation");
    try {
        // Fetch first to confirm ownership and path
        const [rows] = await db.query<AttachmentRow[]>(
            `SELECT * FROM innovation_attachments WHERE id = ?`,
            [attachmentId]
        );
        if (rows.length === 0) return null;

        const attachment = rows[0];
        // Ensure user can only delete their own attachment
        if (attachment.uploaded_by !== userId) {
            throw new Error("Unauthorized to delete this attachment");
        }

        await db.query(`DELETE FROM innovation_attachments WHERE id = ?`, [attachmentId]);
        return attachment;
    } finally {
        await db.end();
    }
}
