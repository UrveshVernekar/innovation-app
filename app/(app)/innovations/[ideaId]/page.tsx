import Link from "next/link";
import { getIdeaDetails } from "@/lib/approvals";
import { getAttachmentsByIdea } from "@/lib/attachments";
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
import { formatDistanceToNow, format } from "date-fns";
import { safeFormatDistanceToNow } from "@/lib/utils";
import { 
    AlertCircle, 
    ArrowLeft, 
    Lightbulb, 
    Building2, 
    Factory, 
    Tag, 
    User, 
    Calendar, 
    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { IdeaDetailAttachments } from "@/components/innovations/idea-detail-attachments";
import { WorkflowStepper } from "@/components/approvals/workflow-stepper";
import { ExportPdfButton } from "@/components/innovations/idea-pdf-export-button";

export default async function IdeaPage({
    params,
}: {
    params: Promise<{ ideaId: string }>;
}) {
    const { ideaId } = await params;
    const numIdeaId = Number(ideaId);
    const idea = await getIdeaDetails(numIdeaId);
    const attachments = await getAttachmentsByIdea(numIdeaId);

    if (!idea) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 mb-4 text-slate-400">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Idea Not Found</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
                    The requested innovation idea could not be found or you may not have permission to view it.
                </p>
                <Button asChild variant="outline" className="mt-6">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 pb-16 px-4 md:px-6">
            {/* Top Navigation & Action Header (Hidden during print) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 print:hidden">
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 gap-1.5"
                >
                    <Link href="/">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Dashboard
                    </Link>
                </Button>

                <div className="flex items-center gap-2">
                    <ExportPdfButton ideaId={numIdeaId} title={idea.title} />
                </div>
            </div>

            {/* Main Header Information Card */}
            <div className="space-y-4 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xs">
                <div className="flex flex-wrap items-center gap-2.5">
                    <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-0.5 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950">
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
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 ml-auto">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            Submitted {safeFormatDistanceToNow(idea.created_at, { addSuffix: true })}
                        </span>
                    )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                    {idea.title}
                </h1>

                {/* Submitter & Department Metadata */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
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
                            <span>Department: <strong className="font-medium text-slate-800 dark:text-slate-300">{idea.department}</strong></span>
                        </div>
                    )}

                    {idea.factory && (
                        <div className="flex items-center gap-1.5">
                            <Factory className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Factory: <strong className="font-medium text-slate-800 dark:text-slate-300">{idea.factory}</strong></span>
                        </div>
                    )}
                </div>
            </div>

            {/* 2-Column Responsive Layout */}
            <div className="grid gap-8 lg:grid-cols-[1.8fr_1.1fr]">
                {/* Left Column: Details & Attachments */}
                <div className="space-y-6">
                    <Card className="shadow-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-primary" />
                                <div>
                                    <CardTitle className="text-lg font-bold">Innovation Proposal</CardTitle>
                                    <CardDescription className="text-xs">Detailed description and expected business impact</CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6 pt-6 text-sm leading-relaxed">
                            {/* Description Section */}
                            <div>
                                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Description & Proposed Solution
                                </h3>
                                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                    {idea.description || "No description provided."}
                                </div>
                            </div>

                            {/* Expected Benefit / Impact Section */}
                            <div>
                                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                    Expected Benefit & Business Impact
                                </h3>
                                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                    {idea.expected_benefit || "No benefit description provided."}
                                </div>
                            </div>

                            {/* Attachments Center */}
                            <IdeaDetailAttachments
                                ideaId={numIdeaId}
                                initialAttachments={attachments}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Workflow Audit Stepper */}
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