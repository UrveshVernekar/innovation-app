import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { createInnovation } from "@/lib/innovations";
import { addAttachment } from "@/lib/attachments";
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

export async function POST(req: Request) {
    try {
        const token = (await cookies()).get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as JwtPayload;

        const contentType = req.headers.get("content-type") || "";

        let title = "";
        let description = "";
        let expected_benefit = "";
        let category = "";
        let filesToUpload: File[] = [];

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            title = (formData.get("title") as string) || "";
            description = (formData.get("description") as string) || "";
            expected_benefit = (formData.get("expected_benefit") as string) || "";
            category = (formData.get("category") as string) || "";
            filesToUpload = formData.getAll("files") as File[];
        } else {
            const body = await req.json();
            title = body.title || "";
            description = body.description || "";
            expected_benefit = body.expected_benefit || "";
            category = body.category || "";
        }

        if (!title || !description) {
            return NextResponse.json(
                { error: "Title and description are required." },
                { status: 400 }
            );
        }

        // Validate attached files if any
        if (filesToUpload.length > MAX_FILES_PER_IDEA) {
            return NextResponse.json(
                { error: `Maximum ${MAX_FILES_PER_IDEA} attachments allowed per innovation.` },
                { status: 400 }
            );
        }

        for (const file of filesToUpload) {
            const val = validateFile(file);
            if (!val.valid) {
                return NextResponse.json({ error: val.error }, { status: 400 });
            }
        }

        // 1. Create Innovation
        const ideaId = await createInnovation({
            title,
            description,
            expected_benefit,
            category,
            userId: decoded.userId,
            factoryId: decoded.factoryID,
            companyId: decoded.companyID,
            departmentId: decoded.departmentID,
        });

        // 2. Upload files if attached
        if (filesToUpload.length > 0 && ideaId > 0) {
            const uploadDir = path.join(process.cwd(), "public", "uploads", "innovations");
            await ensureUploadDirExists(uploadDir);

            for (const file of filesToUpload) {
                const uniqueFileName = sanitizeFileName(file.name);
                const diskPath = path.join(uploadDir, uniqueFileName);
                const publicPath = `/uploads/innovations/${uniqueFileName}`;

                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                await fs.writeFile(diskPath, buffer);

                await addAttachment({
                    ideaId,
                    uploadedBy: decoded.userId,
                    fileName: file.name,
                    filePath: publicPath,
                });
            }
        }

        return NextResponse.json({ 
            success: true, 
            ideaId, 
            message: "Idea submitted successfully with attachments." 
        });
    } catch (err) {
        console.error("Error submitting idea:", err);
        return NextResponse.json(
            { error: "Failed to create idea. Please try again." },
            { status: 500 }
        );
    }
}