import { getIdeaDetails } from "@/lib/approvals";
import { getAttachmentsByIdea } from "@/lib/attachments";
import { cookies } from "next/headers";
import ApprovalActions from "@/components/approvals/approval-actions";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import jwt from "jsonwebtoken";
import { formatDistanceToNow } from "date-fns";
import { safeFormatDistanceToNow } from "@/lib/utils";
import { AlertCircle, ArrowLeft, Lightbulb, Building2, Factory, Tag, User, Calendar, TrendingUp, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { IdeaDetailAttachments } from "@/components/innovations/idea-detail-attachments";
import { WorkflowStepper } from "@/components/approvals/workflow-stepper";

type JwtPayload = {
    userId: number;
};

export default async function ApprovalIdeaPage({
    params,
}: {
    params: Promise<{ ideaId: string }>;
}) {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null;

    let decoded: JwtPayload;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch {
        return null;
    }

    const { ideaId } = await params;
    const numIdeaId = Number(ideaId);
    const idea = await getIdeaDetails(numIdeaId);
    const attachments = await getAttachmentsByIdea(numIdeaId);

    if (!idea) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 text-red-500" />
                <h2 className="text-2xl font-bold">Idea Not Found</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    The requested idea could not be found or you don’t have access.
                </p>
                <Button asChild variant="outline" className="mt-6">
                    <Link href="/approvals">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Approvals
                    </Link>
                </Button>
            </div>
        );
    }

    const currentStageStatus = idea.workflow?.find(item => item.approver_id === decoded.userId)?.status;
    const currentStage = idea.workflow?.find(item => item.approver_id === decoded.userId)?.stage_order;
    const stageVisible = idea.current_stage === currentStage;

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 pb-16 px-4 md:px-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between pt-2">
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 gap-1.5"
                >
                    <Link href="/approvals">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Approvals List
                    </Link>
                </Button>
            </div>

            {/* HEADER */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
                <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5">
                            IDEA #{ideaId}
                        </Badge>
                        <Badge
                            variant={
                                idea.status === "APPROVED"
                                    ? "default"
                                    : idea.status === "REJECTED"
                                        ? "destructive"
                                        : "secondary"
                            }
                            className="text-xs font-semibold px-3 py-0.5 uppercase tracking-wide"
                        >
                            {idea.status}
                        </Badge>

                        {idea.category && (
                            <Badge variant="secondary" className="text-xs px-2.5 py-0.5 gap-1">
                                <Tag className="h-3 w-3 text-primary" />
                                {idea.category}
                            </Badge>
                        )}

                        {idea.created_at && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Submitted {safeFormatDistanceToNow(idea.created_at, { addSuffix: true })}
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                        {idea.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
                        {idea.submitted_by_name && (
                            <div className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span>
                                    Submitted by <strong className="font-semibold text-slate-900 dark:text-slate-200">{idea.submitted_by_name}</strong>
                                </span>
                            </div>
                        )}
                        {idea.department && (
                            <div className="flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span>Department: <strong>{idea.department}</strong></span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full sm:w-auto sm:min-w-[320px] shrink-0">
                    <ApprovalActions
                        ideaId={Number(ideaId)}
                        currentStatus={idea.status}
                        stageStatus={currentStageStatus}
                        stage={stageVisible}
                    />
                </div>
            </div>

            <Separator />

            {/* CONTENT GRID */}
            <div className="grid gap-8 lg:grid-cols-[1.8fr_1.1fr]">
                {/* Left – Details */}
                <div className="space-y-6">
                    <Card className="shadow-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-primary" />
                                <div>
                                    <CardTitle className="text-lg font-bold">Innovation Proposal</CardTitle>
                                    <CardDescription className="text-xs">Core description and expected impact</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6 text-sm leading-relaxed">
                            <div>
                                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Description & Proposed Solution
                                </h3>
                                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                    {idea.description || "No description provided."}
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                    Expected Benefit / Impact
                                </h3>
                                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                    {idea.expected_benefit || "No benefit description provided."}
                                </div>
                            </div>

                            {/* Attachments */}
                            <IdeaDetailAttachments
                                ideaId={numIdeaId}
                                initialAttachments={attachments}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right – Workflow */}
                <div className="space-y-6">
                    <Card className="shadow-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                <div>
                                    <CardTitle className="text-lg font-bold">Approval Audit Log</CardTitle>
                                    <CardDescription className="text-xs">Real-time stage tracking and reviewer feedback</CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <WorkflowStepper
                                stages={idea.workflow || []}
                                currentStageId={idea.current_stage}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}