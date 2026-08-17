"use client";

import React, { useState, useRef } from "react";
import { 
    UploadCloud, 
    X, 
    FileText, 
    FileSpreadsheet, 
    FileCode, 
    File, 
    FileArchive,
    AlertCircle, 
    CheckCircle2, 
    Image as ImageIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    MAX_FILE_SIZE_BYTES, 
    MAX_FILES_PER_IDEA, 
    ALLOWED_EXTENSIONS, 
    validateFile 
} from "@/lib/upload-utils";

interface FileUploaderProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    maxFiles?: number;
    disabled?: boolean;
}

export function formatBytes(bytes: number, decimals = 1) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getFileIcon(fileName: string) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
        case "pdf":
            return <FileText className="h-6 w-6 text-red-500" />;
        case "doc":
        case "docx":
            return <FileText className="h-6 w-6 text-blue-500" />;
        case "xls":
        case "xlsx":
        case "csv":
            return <FileSpreadsheet className="h-6 w-6 text-emerald-500" />;
        case "jpg":
        case "jpeg":
        case "png":
        case "webp":
        case "gif":
            return <ImageIcon className="h-6 w-6 text-purple-500" />;
        case "zip":
            return <FileArchive className="h-6 w-6 text-amber-500" />;
        default:
            return <File className="h-6 w-6 text-slate-500" />;
    }
}

export function FileUploader({
    files,
    onFilesChange,
    maxFiles = MAX_FILES_PER_IDEA,
    disabled = false,
}: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFiles = (newFiles: FileList | File[]) => {
        setErrorMsg(null);
        const incomingArray = Array.from(newFiles);

        if (files.length + incomingArray.length > maxFiles) {
            setErrorMsg(`Maximum limit of ${maxFiles} files exceeded. You can add up to ${maxFiles - files.length} more file(s).`);
            return;
        }

        const validFiles: File[] = [];
        for (const file of incomingArray) {
            const validation = validateFile(file);
            if (!validation.valid) {
                setErrorMsg(validation.error || "Invalid file");
                return;
            }
            // Check for duplicate names
            if (files.some((f) => f.name === file.name && f.size === file.size)) {
                setErrorMsg(`File "${file.name}" has already been selected.`);
                return;
            }
            validFiles.push(file);
        }

        onFilesChange([...files, ...validFiles]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
        // Reset input value to allow re-selecting same file if removed
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeFile = (index: number) => {
        const updated = files.filter((_, i) => i !== index);
        onFilesChange(updated);
        setErrorMsg(null);
    };

    return (
        <div className="space-y-4">
            {/* Drag & Drop Box */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                    isDragging
                        ? "border-primary bg-primary/10 shadow-md scale-[1.01]"
                        : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/50"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_EXTENSIONS.join(",")}
                    onChange={handleFileInputChange}
                    disabled={disabled}
                    className="hidden"
                />

                <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-primary/10 text-primary">
                    <UploadCloud className="w-6 h-6" />
                </div>

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <span className="text-primary hover:underline">Click to upload</span> or drag and drop files here
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-center">
                    Supported: PDF, Word, Excel, CSV, Images (JPG, PNG, WebP), PPT, ZIP (Max 50MB per file, up to 10 files)
                </p>

                <div className="mt-3 flex flex-wrap justify-center gap-1.5 max-w-lg">
                    {ALLOWED_EXTENSIONS.slice(0, 8).map((ext) => (
                        <Badge key={ext} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                            {ext}
                        </Badge>
                    ))}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                        +more
                    </Badge>
                </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
                <div className="flex items-center gap-2 p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Selected File Queue List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                        <span>Selected Files ({files.length}/{maxFiles})</span>
                        <span>Total: {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {files.map((file, idx) => {
                            const isImage = file.type.startsWith("image/");
                            const objectUrl = isImage ? URL.createObjectURL(file) : null;

                            return (
                                <div
                                    key={`${file.name}-${idx}`}
                                    className="relative flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs group transition-all"
                                >
                                    <div className="flex items-center gap-3 min-w-0 pr-2">
                                        {isImage && objectUrl ? (
                                            <div className="w-10 h-10 rounded bg-slate-200 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-800">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={objectUrl}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-2 rounded bg-slate-200/70 dark:bg-slate-950 shrink-0 border border-slate-300 dark:border-slate-800">
                                                {getFileIcon(file.name)}
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                {formatBytes(file.size)}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(idx);
                                        }}
                                        disabled={disabled}
                                        className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
                                    >
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Remove file</span>
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
