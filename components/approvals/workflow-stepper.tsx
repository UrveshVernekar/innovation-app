"use client";

import React from "react";
import { formatDistanceToNow, format } from "date-fns";
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ShieldCheck, 
    Award, 
    MessageSquareQuote, 
    UserCheck 
} from "lucide-react";
import { cn, safeFormatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { WorkflowStageDetail } from "@/lib/approvals";

interface WorkflowStepperProps {
    stages: WorkflowStageDetail[];
    currentStageId?: number;
}

export function WorkflowStepper({ stages, currentStageId }: WorkflowStepperProps) {
    if (!stages || stages.length === 0) {
        return (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                No workflow stages configured for this innovation.
            </p>
        );
    }

    const totalStages = stages.length;
    const completedStages = stages.filter((s) => s.status === "APPROVED").length;
    const isRejected = stages.some((s) => s.status === "REJECTED");
    const progressPercent = Math.round((completedStages / totalStages) * 100);

    return (
        <div className="space-y-6">
            {/* Progress Bar & Header Stats */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Approval Progress
                    </span>
                    <span className="font-mono">
                        {completedStages} / {totalStages} Stages ({progressPercent}%)
                    </span>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-500 ease-out",
                            isRejected
                                ? "bg-red-500"
                                : progressPercent === 100
                                ? "bg-emerald-500 dark:bg-emerald-400"
                                : "bg-primary"
                        )}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Stepper Timeline */}
            <div className="relative space-y-6 pl-2">
                {stages.map((stage, idx) => {
                    const isApproved = stage.status === "APPROVED";
                    const isStageRejected = stage.status === "REJECTED";
                    const isPending = stage.status === "PENDING";
                    const isLast = idx === stages.length - 1;

                    return (
                        <div key={stage.workflow_stage_id || idx} className="relative pl-9 group">
                            {/* Vertical Line Connecting Stages */}
                            {!isLast && (
                                <div
                                    className={cn(
                                        "absolute left-3.5 top-7 bottom-[-24px] w-0.5 transition-colors",
                                        isApproved
                                            ? "bg-emerald-500 dark:bg-emerald-600"
                                            : isStageRejected
                                            ? "bg-red-400 dark:bg-red-600"
                                            : "bg-slate-200 dark:bg-slate-800"
                                    )}
                                />
                            )}

                            {/* Circle Status Badge */}
                            <div
                                className={cn(
                                    "absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all shadow-xs",
                                    isApproved &&
                                        "border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-400 ring-2 ring-emerald-500/20",
                                    isStageRejected &&
                                        "border-red-500 bg-red-50 text-red-600 dark:border-red-500 dark:bg-red-950/60 dark:text-red-400 ring-2 ring-red-500/20",
                                    isPending &&
                                        "border-amber-500 bg-amber-50 text-amber-600 dark:border-amber-500 dark:bg-amber-950/60 dark:text-amber-400 ring-2 ring-amber-500/20 animate-pulse",
                                    !isApproved && !isStageRejected && !isPending &&
                                        "border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-400"
                                )}
                            >
                                {isApproved && <CheckCircle2 className="h-4 w-4" />}
                                {isStageRejected && <XCircle className="h-4 w-4" />}
                                {isPending && <Clock className="h-4 w-4" />}
                                {!isApproved && !isStageRejected && !isPending && (idx + 1)}
                            </div>

                            {/* Content Body */}
                            <div className="space-y-1.5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 p-3 rounded-xl transition-all hover:border-slate-300 dark:hover:border-slate-700">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <span>{stage.stage_name}</span>
                                        {stage.points_on_approval && isApproved && (
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-mono gap-1"
                                            >
                                                <Award className="h-3 w-3" />
                                                +{stage.points_on_approval} pts
                                            </Badge>
                                        )}
                                    </h4>

                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[10px] uppercase font-mono px-2 py-0.5",
                                            isApproved && "border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30",
                                            isStageRejected && "border-red-500 text-red-700 dark:text-red-400 bg-red-50/50 dark:bg-red-950/30",
                                            isPending && "border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30"
                                        )}
                                    >
                                        {stage.status}
                                    </Badge>
                                </div>

                                {/* Approver Name & Date */}
                                {stage.approver_name && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                        <UserCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                        <span>
                                            Actioned by <strong className="font-medium text-slate-800 dark:text-slate-200">{stage.approver_name}</strong>
                                        </span>
                                        {stage.actioned_at && (
                                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                                                • {safeFormatDate(stage.actioned_at)}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Approver Feedback Comments */}
                                {stage.comments && (
                                    <div className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 italic">
                                        <MessageSquareQuote className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                        <p className="min-w-0 flex-1 leading-relaxed">
                                            "{stage.comments}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
