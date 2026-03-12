// app/(app)/approvals/page.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getPendingApprovals } from "@/lib/approvals";
import ApprovalTable from "@/components/approvals/approval-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Clock
} from "lucide-react";

type JwtPayload = {
    userId: number;
    companyID: number;
    factoryID: number;
    departmentID: number;
};

export default async function ApprovalsPage() {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null; // In prod → redirect("/login")

    let decoded: JwtPayload;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch {
        return null; // or redirect
    }

    const approvals = await getPendingApprovals(decoded.userId);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
                    <p className="text-muted-foreground">
                        Review and decide on new ideas awaiting your approval
                    </p>
                </div>

                {/* Optional future stats/badges */}
                <div className="flex items-center gap-3">
                    {approvals.length > 0 && (
                        <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            <Clock className="h-4 w-4" />
                            {approvals.length} pending
                        </div>
                    )}
                </div>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Ideas Awaiting Review</CardTitle>
                    <CardDescription>
                        {approvals.length === 0
                            ? "No pending approvals at the moment."
                            : `Showing ${approvals.length} idea${approvals.length !== 1 ? "s" : ""}`}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <ApprovalTable approvals={approvals} />
                </CardContent>
            </Card>
        </div>
    );
}