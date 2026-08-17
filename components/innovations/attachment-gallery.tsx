"use client";

import React, { useState } from "react";
import { 
    Download, 
    Eye, 
    Trash2, 
    FileText, 
    Paperclip, 
    ExternalLink, 
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { getFileIcon } from "@/components/ui/file-uploader";
import { AttachmentRecord } from "@/lib/attachments";

interface AttachmentGalleryProps {
    ideaId: number;
    attachments: AttachmentRecord[];
    canDelete?: boolean;
    showTitle?: boolean;
    onAttachmentDeleted?: (deletedId: number) => void;
}

export function AttachmentGallery({
    ideaId,
    attachments,
    canDelete = false,
    showTitle = true,
    onAttachmentDeleted,
}: AttachmentGalleryProps) {
    const [previewAttachment, setPreviewAttachment] = useState<AttachmentRecord | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    if (!attachments || attachments.length === 0) {
        return null;
    }

    const handleDelete = async (attId: number) => {
        if (!confirm("Are you sure you want to delete this attachment?")) return;
        setDeletingId(attId);
        try {
            const res = await fetch(`/api/innovations/${ideaId}/attachments/${attId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                onAttachmentDeleted?.(attId);
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete attachment");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Error deleting attachment");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-3">
            {showTitle && (
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <Paperclip className="h-4 w-4 text-primary" />
                    <span>Attachments & Proof of Concept ({attachments.length})</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {attachments.map((att) => {
                    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(att.file_name);
                    const isPdf = /\.pdf$/i.test(att.file_name);

                    return (
                        <div
                            key={att.id}
                            className="group relative flex flex-col justify-between p-3.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 hover:border-primary/50"
                        >
                            {/* Top row: Thumbnail or File Icon */}
                            <div className="flex items-start gap-3">
                                {isImage ? (
                                    <div 
                                        onClick={() => setPreviewAttachment(att)}
                                        className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-800 cursor-pointer group-hover:opacity-90 transition-opacity"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={att.file_path}
                                            alt={att.file_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-slate-200/70 dark:bg-slate-950 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-800">
                                        {getFileIcon(att.file_name)}
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <p
                                        title={att.file_name}
                                        className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => (isImage || isPdf ? setPreviewAttachment(att) : window.open(att.file_path, "_blank"))}
                                    >
                                        {att.file_name}
                                    </p>

                                    <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                        {att.uploader_name ? `Uploaded by ${att.uploader_name}` : "Attached file"}
                                    </p>

                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                        {new Date(att.uploaded_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Bottom row: Actions */}
                            <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    {(isImage || isPdf) && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPreviewAttachment(att)}
                                            className="h-7 px-2 text-[11px] text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-slate-200/60 dark:hover:bg-slate-800"
                                        >
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            Preview
                                        </Button>
                                    )}

                                    <a
                                        href={att.file_path}
                                        download={att.file_name}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center h-7 px-2 text-[11px] text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md transition-colors font-medium"
                                    >
                                        <Download className="h-3.5 w-3.5 mr-1" />
                                        Download
                                    </a>
                                </div>

                                {canDelete && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={deletingId === att.id}
                                        onClick={() => handleDelete(att.id)}
                                        className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg"
                                    >
                                        {deletingId === att.id ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-3.5 w-3.5" />
                                        )}
                                        <span className="sr-only">Delete</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Lightbox / Preview Dialog */}
            <Dialog open={!!previewAttachment} onOpenChange={() => setPreviewAttachment(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-4 bg-slate-900 text-slate-100 border-slate-800">
                    <DialogHeader className="pb-2 flex flex-row items-center justify-between border-b border-slate-800">
                        <div>
                            <DialogTitle className="text-base truncate max-w-lg text-slate-100">
                                {previewAttachment?.file_name}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-400">
                                Previewing attachment
                            </DialogDescription>
                        </div>
                        {previewAttachment && (
                            <a
                                href={previewAttachment.file_path}
                                download={previewAttachment.file_name}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline pr-6"
                            >
                                <ExternalLink className="h-3.5 w-3.5" /> Open / Download
                            </a>
                        )}
                    </DialogHeader>

                    <div className="flex-1 overflow-auto flex items-center justify-center p-2 min-h-[400px] bg-slate-950 rounded-lg border border-slate-800">
                        {previewAttachment && (
                            /\.(jpg|jpeg|png|webp|gif)$/i.test(previewAttachment.file_name) ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={previewAttachment.file_path}
                                    alt={previewAttachment.file_name}
                                    className="max-h-[70vh] max-w-full object-contain rounded-md shadow-lg"
                                />
                            ) : /\.pdf$/i.test(previewAttachment.file_name) ? (
                                <iframe
                                    src={previewAttachment.file_path}
                                    className="w-full h-[70vh] rounded-md border-0 bg-white"
                                    title={previewAttachment.file_name}
                                />
                            ) : (
                                <div className="text-center text-slate-300 space-y-3">
                                    <FileText className="h-16 w-16 mx-auto text-slate-500" />
                                    <p>Direct preview is not available for this document type.</p>
                                    <Button asChild variant="outline">
                                        <a href={previewAttachment.file_path} download={previewAttachment.file_name}>
                                            Download File
                                        </a>
                                    </Button>
                                </div>
                            )
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
