import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { 
    addAttachment, 
    getAttachmentsByIdea, 
    getAttachmentCount 
} from "@/lib/attachments";
import { 
    validateFile, 
    sanitizeFileName, 
    MAX_FILES_PER_IDEA 
} from "@/lib/upload-utils";
import { ensureUploadDirExists } from "@/lib/server-upload-utils";

type JwtPayload = {
    userId: number;
    companyID: number;
    factoryID: number;
    departmentID: number;
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

// GET /api/innovations/[id]/attachments
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const ideaId = parseInt(id, 10);
        if (isNaN(ideaId)) {
            return NextResponse.json({ error: "Invalid idea ID" }, { status: 400 });
        }

        const attachments = await getAttachmentsByIdea(ideaId);
        return NextResponse.json({ success: true, attachments });
    } catch (err) {
        console.error("Failed to fetch attachments:", err);
        return NextResponse.json(
            { error: "Failed to fetch attachments" },
            { status: 500 }
        );
    }
}

// POST /api/innovations/[id]/attachments
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const ideaId = parseInt(id, 10);
        if (isNaN(ideaId)) {
            return NextResponse.json({ error: "Invalid idea ID" }, { status: 400 });
        }

        const formData = await req.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: "No files were provided for upload" },
                { status: 400 }
            );
        }

        // Check existing attachment count
        const existingCount = await getAttachmentCount(ideaId);
        if (existingCount + files.length > MAX_FILES_PER_IDEA) {
            return NextResponse.json(
                {
                    error: `Cannot upload ${files.length} file(s). Total attachments per idea cannot exceed ${MAX_FILES_PER_IDEA} (Currently has ${existingCount}).`,
                },
                { status: 400 }
            );
        }

        // Validate all files first before saving
        for (const file of files) {
            const val = validateFile(file);
            if (!val.valid) {
                return NextResponse.json({ error: val.error }, { status: 400 });
            }
        }

        const uploadDir = path.join(process.cwd(), "public", "uploads", "innovations");
        await ensureUploadDirExists(uploadDir);

        const savedAttachments = [];

        for (const file of files) {
            const uniqueFileName = sanitizeFileName(file.name);
            const diskPath = path.join(uploadDir, uniqueFileName);
            const publicPath = `/uploads/innovations/${uniqueFileName}`;

            // Convert File buffer & write to disk
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await fs.writeFile(diskPath, buffer);

            // Save to database
            const attachmentId = await addAttachment({
                ideaId,
                uploadedBy: user.userId,
                fileName: file.name,
                filePath: publicPath,
            });

            savedAttachments.push({
                id: attachmentId,
                idea_id: ideaId,
                uploaded_by: user.userId,
                file_name: file.name,
                file_path: publicPath,
                uploaded_at: new Date(),
            });
        }

        return NextResponse.json({
            success: true,
            attachments: savedAttachments,
            message: `${savedAttachments.length} file(s) uploaded successfully.`,
        });
    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json(
            { error: "File upload failed. Please try again." },
            { status: 500 }
        );
    }
}
