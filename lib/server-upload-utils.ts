import { existsSync, mkdirSync } from "fs";

export async function ensureUploadDirExists(targetDir: string) {
    if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
    }
}
