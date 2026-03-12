// app/page.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getUserDashboardStats } from "@/lib/dashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Lightbulb,
    Clock,
    CheckCircle2,
    Award,
    PlusCircle,
} from "lucide-react";
import KpiCard from "@/components/dashboard/kpi-card";

interface TokenPayload {
    userId: number;
    factoryID: number;
    companyID: number;
    role: string;
    name?: string; // ← optional: add if your JWT includes it
}

export default async function Dashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        // In production → redirect("/login") instead of null
        return null;
    }

    let decoded: TokenPayload;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    } catch (err) {
        // Invalid token → redirect or show error
        console.error(err);
        return null;
    }

    const stats = await getUserDashboardStats(decoded.userId);

    // Optional: fallback / skeleton-like defaults
    const safeStats = {
        totalIdeas: stats?.totalIdeas ?? 0,
        pendingIdeas: stats?.pendingIdeas ?? 0,
        approvedIdeas: stats?.approvedIdeas ?? 0,
        totalPoints: stats?.totalPoints ?? 0,
    };

    return (
        <div className="space-y-10 pb-12">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Innovation Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Welcome back{decoded.name ? `, ${decoded.name}` : ""} — here’s your
                        innovation overview
                    </p>
                </div>

                <Button asChild size="lg" className="gap-2 whitespace-nowrap">
                    <Link href="/innovations/new">
                        <PlusCircle className="h-5 w-5" />
                        Submit New Idea
                    </Link>
                </Button>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    icon={<Lightbulb className="h-6 w-6 text-primary" />}
                    title="Total Ideas"
                    value={safeStats.totalIdeas}
                    description="All ideas you've submitted"
                    trend="neutral" // can be "up" | "down" | "neutral" later
                />
                <KpiCard
                    icon={<Clock className="h-6 w-6 text-amber-600 dark:text-amber-500" />}
                    title="Pending"
                    value={safeStats.pendingIdeas}
                    description="Waiting for review"
                    trend="neutral"
                />
                <KpiCard
                    icon={
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500" />
                    }
                    title="Approved"
                    value={safeStats.approvedIdeas}
                    description="Ideas implemented / accepted"
                    trend="neutral"
                />
                <KpiCard
                    icon={<Award className="h-6 w-6 text-purple-600 dark:text-purple-500" />}
                    title="Reward Points"
                    value={safeStats.totalPoints}
                    description="Innovation contribution score"
                    trend="neutral"
                    highlight // optional prop for visual emphasis
                />
            </div>

            {/* Future sections placeholders */}
            {/* <div className="grid gap-6 lg:grid-cols-2">
        <RecentIdeasCard />
        <TopContributorsCard />
      </div> */}
        </div>
    );
}