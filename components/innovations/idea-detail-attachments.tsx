"use client";

import React, { useState } from "react";
import { AttachmentRecord } from "@/lib/attachments";
import { AttachmentGallery } from "@/components/innovations/attachment-gallery";
import { FileUploader } from "@/components/ui/file-uploader";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Paperclip, X } from "lucide-react";
import { toast } from "sonner";

interface IdeaDetailAttachmentsProps {
    ideaId: number;
    initialAttachments: AttachmentRecord[];
}

export function IdeaDetailAttachments({
    ideaId,
    initialAttachments,
}: IdeaDetailAttachmentsProps) {
    const [attachments, setAttachments] = useState<AttachmentRecord[]>(initialAttachments);
    const [showUpload, setShowUpload] = useState(false);
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleAttachmentDeleted = (deletedId: number) => {
        setAttachments((prev) => prev.filter((a) => a.id !== deletedId));
        toast.success("Attachment deleted");
    };

    const handleUploadSubmit = async () => {
        if (filesToUpload.length === 0) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            filesToUpload.forEach((f) => formData.append("files", f));

            const res = await fetch(`/api/innovations/${ideaId}/attachments`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setAttachments((prev) => [...data.attachments, ...prev]);
                setFilesToUpload([]);
                setShowUpload(false);
                toast.success(data.message || "Attachments uploaded!");
            } else {
                toast.error(data.error || "Upload failed");
            }
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Failed to upload attachments");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <Paperclip className="h-4 w-4 text-primary shrink-0" />
                    <span>Attached Proofs & Documents ({attachments.length})</span>
                </div>

                <Button
                    type="button"
                    variant={showUpload ? "outline" : "secondary"}
                    size="sm"
                    onClick={() => setShowUpload(!showUpload)}
                    className="text-xs h-8 gap-1.5"
                >
                    {showUpload ? (
                        <>
                            <X className="h-3.5 w-3.5" /> Cancel Upload
                        </>
                    ) : (
                        <>
                            <PlusCircle className="h-3.5 w-3.5" /> Upload Files
                        </>
                    )}
                </Button>
            </div>

            {/* Collapsible Uploader Zone */}
            {showUpload && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                    <FileUploader
                        files={filesToUpload}
                        onFilesChange={setFilesToUpload}
                        disabled={isUploading}
                    />

                    {filesToUpload.length > 0 && (
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setFilesToUpload([])}
                                disabled={isUploading}
                            >
                                Clear
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleUploadSubmit}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    `Upload ${filesToUpload.length} File(s)`
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Attachments Gallery */}
            {attachments.length > 0 ? (
                <AttachmentGallery
                    ideaId={ideaId}
                    attachments={attachments}
                    canDelete={true}
                    showTitle={false}
                    onAttachmentDeleted={handleAttachmentDeleted}
                />
            ) : (
                !showUpload && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2">
                        No attachments uploaded for this idea yet.
                    </p>
                )
            )}
        </div>
    );
}
