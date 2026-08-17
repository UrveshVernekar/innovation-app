import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { deleteAttachment } from "@/lib/attachments";

type JwtPayload = {
    userId: number;
};

async function getAuthUser() {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch {
        return null;
    }
}

// DELETE /api/innovations/[id]/attachments/[attachmentId]
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { attachmentId } = await params;
        const attId = parseInt(attachmentId, 10);
        if (isNaN(attId)) {
            return NextResponse.json({ error: "Invalid attachment ID" }, { status: 400 });
        }

        const deletedRecord = await deleteAttachment(attId, user.userId);
        if (!deletedRecord) {
            return NextResponse.json(
                { error: "Attachment not found or permission denied" },
                { status: 404 }
            );
        }

        // Try deleting from disk
        if (deletedRecord.file_path.startsWith("/uploads/")) {
            const diskPath = path.join(process.cwd(), "public", deletedRecord.file_path);
            try {
                await fs.unlink(diskPath);
            } catch (fsErr) {
                console.warn(`File on disk could not be removed: ${diskPath}`, fsErr);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Attachment removed successfully.",
        });
    } catch (err: any) {
        console.error("Delete error:", err);
        return NextResponse.json(
            { error: err.message || "Failed to delete attachment" },
            { status: 500 }
        );
    }
}
