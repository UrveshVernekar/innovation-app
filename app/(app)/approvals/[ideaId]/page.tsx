import { getIdeaDetails } from "@/lib/approvals";
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
import { cn } from "@/lib/utils";
import jwt from "jsonwebtoken";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";

type JwtPayload = {
    userId: number;
};

export default async function IdeaPage({
    params,
}: {
    params: Promise<{ ideaId: string }>;
}) {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null; // In prod → redirect("/login")

    let decoded: JwtPayload;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch {
        return null; // or redirect
    }

    const { ideaId } = await params;
    const idea = await getIdeaDetails(Number(ideaId));

    const currentStageStatus = idea.workflow.find(item => item.approver_id === decoded.userId)?.status;
    const currentStage = idea.workflow.find(item => item.approver_id === decoded.userId)?.stage_order;
    const stageVisible = idea.current_stage === currentStage;

    if (!idea) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold">Idea not found</h2>
                <p className="text-muted-foreground mt-2">
                    The requested idea could not be found or you don’t have access.
                </p>
            </div>
        );
    }

    const totalStages = idea.workflow?.length ?? 0;
    const completed = idea.workflow?.filter((s) => s.status === "APPROVED").length ?? 0;
    const progress = totalStages > 0 ? Math.round((completed / totalStages) * 100) : 0;

    return (
        <div className="mx-auto w-full max-w-7xl space-y-10 pb-16 px-4 md:px-6">
            {/* HEADER */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="font-mono text-xs">
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
                            className="text-sm px-4 py-1"
                        >
                            {idea.status}
                        </Badge>
                        {idea.submitted_at && (
                            <span className="text-sm text-muted-foreground">
                                Submitted {formatDistanceToNow(new Date(idea.submitted_at), { addSuffix: true })}
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        {idea.title}
                    </h1>

                    {idea.submitted_by_name && (
                        <p className="text-sm text-muted-foreground">
                            Submitted by <span className="font-medium">{idea.submitted_by_name}</span>
                        </p>
                    )}
                </div>

                <div className="w-full sm:w-auto sm:min-w-[320px]">
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
            <div className="grid gap-8 lg:grid-cols-[2fr_0.9fr]">
                {/* Left – Details */}


                {/* Right – Workflow */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Idea Details</CardTitle>
                        <CardDescription>Core description and expected impact</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 text-base leading-relaxed">
                        <div>
                            <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Description
                            </h3>
                            <p className="whitespace-pre-wrap">{idea.description || "No description provided."}</p>
                        </div>

                        <div>
                            <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Expected Benefit / Impact
                            </h3>
                            <p className="whitespace-pre-wrap">
                                {idea.expected_benefit || "No benefit description provided."}
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            {idea.category && (
                                <div>
                                    <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                        Category
                                    </h3>
                                    <p className="font-medium">{idea.category}</p>
                                </div>
                            )}
                            {idea.department && (
                                <div>
                                    <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                        Department
                                    </h3>
                                    <p className="font-medium">{idea.department}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Approval Workflow</CardTitle>
                        <CardDescription className="flex items-center justify-between">
                            <span>Progress</span>
                            <span className="font-medium">
                                {completed} / {totalStages} stages approved
                            </span>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Progress bar */}
                        <div className="h-2.5 w-full rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-linear-to-r from-green-500 to-emerald-600 transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Timeline / Stepper */}
                        <div className="space-y-6">
                            {idea.workflow?.map((stage, idx) => (
                                <div key={stage.workflow_stage_id} className="relative pl-10">
                                    {/* Vertical line */}
                                    {idx < idea.workflow.length - 1 && (
                                        <div className="absolute left-4 top-5 bottom-0 w-0.5 bg-border" />
                                    )}

                                    {/* Circle */}
                                    <div
                                        className={cn(
                                            "absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 text-lg shadow-sm",
                                            stage.status === "APPROVED" && "border-green-500 bg-green-50 text-green-700",
                                            stage.status === "REJECTED" && "border-red-500 bg-red-50 text-red-700",
                                            stage.status === "PENDING" && "border-amber-500 bg-amber-50 text-amber-700",
                                            !["APPROVED", "REJECTED", "PENDING"].includes(stage.status) &&
                                            "border-gray-300 bg-gray-50 text-gray-500"
                                        )}
                                    >
                                        {stage.status === "APPROVED" && <CheckCircle2 className="h-5 w-5" />}
                                        {stage.status === "REJECTED" && <XCircle className="h-5 w-5" />}
                                        {stage.status === "PENDING" && <Clock className="h-5 w-5" />}
                                        {!["APPROVED", "REJECTED", "PENDING"].includes(stage.status) && idx + 1}
                                    </div>

                                    <div>
                                        <h4 className="font-semibold">{stage.stage_name}</h4>
                                        <p className="mt-0.5 text-sm capitalize text-muted-foreground">
                                            {stage.status.toLowerCase()}
                                            {stage.approved_by_name && ` • by ${stage.approved_by_name}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}