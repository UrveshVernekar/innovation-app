export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_FILES_PER_IDEA = 10;

export const ALLOWED_EXTENSIONS = [
    ".pdf",
    ".docx",
    ".doc",
    ".xlsx",
    ".xls",
    ".csv",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".txt",
    ".pptx",
    ".ppt",
    ".zip",
];

export function getFileExtension(filename: string): string {
    const idx = filename.lastIndexOf(".");
    return idx !== -1 ? filename.substring(idx).toLowerCase() : "";
}

export function validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            valid: false,
            error: `File "${file.name}" exceeds the maximum limit of 50MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
        };
    }

    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return {
            valid: false,
            error: `File type "${ext}" is not supported. Allowed formats: ${ALLOWED_EXTENSIONS.join(", ")}`,
        };
    }

    return { valid: true };
}

export function sanitizeFileName(originalName: string): string {
    const ext = getFileExtension(originalName);
    const lastDotIndex = originalName.lastIndexOf(".");
    const baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
    const sanitizedBase = baseName.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 80);
    const uniqueSuffix = Date.now() + "_" + Math.random().toString(36).substring(2, 8);
    return `${sanitizedBase}_${uniqueSuffix}${ext}`;
}
