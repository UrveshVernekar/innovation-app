// components/approvals/approval-actions.tsx
"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

interface ApprovalActionsProps {
    ideaId: number;
    currentStatus?: string;
    stageStatus?: string;
    stage?: boolean;
}

export default function ApprovalActions({
    ideaId,
    currentStatus,
    stageStatus,
    stage
}: ApprovalActionsProps) {
    const router = useRouter();
    const [comments, setComments] = useState("");
    const [action, setAction] = useState<"APPROVE" | "REJECT" | null>(null);
    const [isPending, startTransition] = useTransition();

    const isFinal = ["APPROVED", "REJECTED"].includes(currentStatus || "");
    const isStage = ["APPROVED", "REJECTED"].includes(stageStatus || "");

    console.log("STAGE STATUS", stageStatus);
    console.log("STAGE", stage);

    async function submitAction() {
        if (!action) return;

        startTransition(async () => {
            try {
                const res = await fetch("/api/approvals", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ideaId,
                        action,
                        comments: comments.trim() || undefined,
                    }),
                });

                if (!res.ok) throw new Error();

                toast.success(`Idea ${action.toLowerCase()}d successfully`);
                router.refresh();
                setAction(null);
                setComments("");
            } catch {
                toast.error("Failed to process action. Please try again.");
            }
        });
    }

    if (!stage && stageStatus !== "APPROVED") {
        return (
            <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50">
                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                </div>

                <h3 className="text-base font-medium">
                    This stage is not yet ready for your review
                </h3>

                <div className="pt-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/approvals">
                            Back to Pending Approvals
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-5 rounded-lg border bg-card p-6 shadow-sm">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                        Approval Comments
                    </label>
                    <Textarea
                        placeholder="Add your feedback or reason for rejection (optional for approval)"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows={4}
                        disabled={isPending || isFinal || isStage}
                        className="resize-none mt-1"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        size="lg"
                        className="flex-1"
                        disabled={isPending || isFinal || isStage}
                        onClick={() => setAction("APPROVE")}
                    >
                        {!isStage && isPending && action === "APPROVE" ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Approving...
                            </>
                        ) : (
                            "Approve"
                        )}
                    </Button>

                    <Button
                        variant="destructive"
                        size="lg"
                        className="flex-1"
                        disabled={isPending || isFinal || isStage}
                        onClick={() => setAction("REJECT")}
                    >
                        {!isStage && isPending && action === "REJECT" ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Rejecting...
                            </>
                        ) : (
                            "Reject"
                        )}
                    </Button>
                </div>

                {(isFinal || isStage) && (
                    <p className="text-center text-sm text-muted-foreground pt-2">
                        This idea has already been {currentStatus?.toLowerCase()}.
                    </p>
                )}
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={!!action} onOpenChange={() => setAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {action === "APPROVE" ? "Approve this idea?" : "Reject this idea?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {action === "APPROVE"
                                ? "This will move the idea to the next approval stage (if any)."
                                : "Please make sure to provide clear comments explaining the rejection."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isPending}
                            onClick={(e) => {
                                e.preventDefault();
                                submitAction();
                            }}
                            className={action === "REJECT" ? "bg-destructive hover:bg-destructive/90" : ""}
                        >
                            {action === "APPROVE" ? "Confirm Approve" : "Confirm Reject"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}