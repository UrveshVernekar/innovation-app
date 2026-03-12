// components/approvals/approval-table.tsx
"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertCircle,
    ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApprovalRow {
    idea_id: number;
    title: string;
    submitted_by: number; // could later show name if you fetch it
    stage_name: string;
    created_at: Date | string;
}

interface ApprovalTableProps {
    approvals: ApprovalRow[];
}

export default function ApprovalTable({ approvals }: ApprovalTableProps) {
    if (approvals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground/60 mb-4" />
                <h3 className="text-lg font-medium">No pending approvals</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    There are currently no ideas waiting for your review. Check back later or explore submitted ideas.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[45%]">Idea</TableHead>
                        <TableHead className="w-[20%]">Stage</TableHead>
                        <TableHead className="w-[20%] hidden sm:table-cell">Submitted</TableHead>
                        <TableHead className="w-[15%] text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {approvals.map((approval) => (
                        <TableRow
                            key={approval.idea_id}
                            className="hover:bg-muted/40 transition-colors"
                        >
                            <TableCell className="font-medium">
                                <div className="line-clamp-2">{approval.title}</div>
                                <div className="text-xs text-muted-foreground mt-1 sm:hidden">
                                    {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
                                </div>
                            </TableCell>

                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "font-normal",
                                        approval.stage_name.toLowerCase().includes("review") && "border-amber-500 text-amber-700 dark:text-amber-400",
                                        approval.stage_name.toLowerCase().includes("approve") && "border-green-500 text-green-700 dark:text-green-400"
                                    )}
                                >
                                    {approval.stage_name}
                                </Badge>
                            </TableCell>

                            <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">
                                {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
                            </TableCell>

                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="gap-1 text-primary hover:text-primary/90 hover:bg-primary/5"
                                >
                                    <Link href={`/approvals/${approval.idea_id}`}>
                                        View
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}