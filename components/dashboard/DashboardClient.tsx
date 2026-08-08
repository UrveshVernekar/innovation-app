// components/dashboard/DashboardClient.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Lightbulb,
    Clock,
    CheckCircle2,
    Award,
    PlusCircle,
    ArrowRight,
    TrendingUp,
    Sparkles,
    Calendar,
    Users,
    Trophy,
    Medal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import KpiCard from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Recharts
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";

import { ChartDataRow, CategoryBreakdownRow, TopContributorRow, RecentIdeaRow } from "@/lib/dashboard";
import { DashboardStats } from "@/types/dashboard";

interface DashboardClientProps {
    userFullName: string;
    stats: DashboardStats;
    chartData: ChartDataRow[];
    categoryBreakdown: CategoryBreakdownRow[];
    topContributors: TopContributorRow[];
    recentIdeas: RecentIdeaRow[];
}

// Colors for Pie Chart
const COLORS = [
    "oklch(0.646 0.222 41.116)",  // Orange / Coral
    "oklch(0.6 0.118 184.704)",   // Blue
    "oklch(0.696 0.17 162.48)",    // Emerald / Green
    "oklch(0.828 0.189 84.429)",   // Yellow
    "oklch(0.627 0.265 303.9)",    // Purple
    "oklch(0.556 0 0)"            // Slate / Gray
];

export default function DashboardClient({
    userFullName,
    stats,
    chartData,
    categoryBreakdown,
    topContributors,
    recentIdeas,
}: DashboardClientProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Helper for user initials
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .filter(Boolean)
            .map(word => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    return (
        <div className="space-y-8 pb-12 max-w-6xl mx-auto px-1 py-4">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                        Innovation Dashboard
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Welcome back, <span className="font-semibold text-foreground">{userFullName}</span> — here’s your innovation progress overview
                    </p>
                </div>

                <Button asChild size="lg" className="gap-2 whitespace-nowrap cursor-pointer shadow-md">
                    <Link href="/innovations/new">
                        <PlusCircle className="h-5 w-5" />
                        Submit New Idea
                    </Link>
                </Button>
            </div>

            {/* KPI Grid (Linked & Interactive) */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    icon={<Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                    title="Total Ideas"
                    value={stats.totalIdeas}
                    description="All ideas you've submitted"
                    href="/innovations"
                />
                <KpiCard
                    icon={<Clock className="h-6 w-6 text-amber-500" />}
                    title="Pending Review"
                    value={stats.pendingIdeas}
                    description="Waiting for stage approvals"
                    href="/innovations"
                />
                <KpiCard
                    icon={<CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                    title="Approved Ideas"
                    value={stats.approvedIdeas}
                    description="Successfully approved ideas"
                    href="/innovations"
                />
                <KpiCard
                    icon={<Award className="h-6 w-6 text-purple-500" />}
                    title="Reward Points"
                    value={stats.totalPoints}
                    description="Innovation score standing"
                    highlight
                    href="/leaderboard"
                />
            </div>

            {/* Chart visualizations */}
            {mounted && (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Submission trend Area Chart */}
                    <Card className="lg:col-span-2 border border-border bg-card shadow-sm rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-1.5">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                                Ideas Activity Trend
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Visualizing submitted and approved ideas over the last 6 months.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[280px] pl-0">
                            {chartData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                                    No activity in the last 6 months.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={chartData}
                                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="submittedColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="oklch(0.6 0.118 184.704)" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="oklch(0.6 0.118 184.704)" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="approvedColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="oklch(0.696 0.17 162.48)" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="oklch(0.696 0.17 162.48)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                                        <XAxis 
                                            dataKey="month" 
                                            axisLine={false}
                                            tickLine={false}
                                            style={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                        />
                                        <YAxis 
                                            axisLine={false}
                                            tickLine={false}
                                            allowDecimals={false}
                                            style={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                        />
                                        <ChartTooltip 
                                            contentStyle={{
                                                backgroundColor: "var(--card)",
                                                border: "1px solid var(--border)",
                                                borderRadius: "8px",
                                                fontSize: "11px"
                                            }}
                                        />
                                        <Legend 
                                            verticalAlign="top" 
                                            height={36} 
                                            iconType="circle"
                                            iconSize={8}
                                            wrapperStyle={{ fontSize: 11, fill: "var(--foreground)" }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            name="Ideas Submitted" 
                                            dataKey="submitted" 
                                            stroke="oklch(0.6 0.118 184.704)" 
                                            fillOpacity={1} 
                                            fill="url(#submittedColor)" 
                                            strokeWidth={2}
                                        />
                                        <Area 
                                            type="monotone" 
                                            name="Ideas Approved" 
                                            dataKey="approved" 
                                            stroke="oklch(0.696 0.17 162.48)" 
                                            fillOpacity={1} 
                                            fill="url(#approvedColor)" 
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Category Breakdown Donut Chart */}
                    <Card className="border border-border bg-card shadow-sm rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-lg">Category Distribution</CardTitle>
                            <CardDescription className="text-xs">
                                Distribution of your submitted ideas by category.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[280px] flex flex-col justify-center">
                            {categoryBreakdown.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                                    No category details recorded.
                                </div>
                            ) : (
                                <>
                                    <div className="h-[180px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={categoryBreakdown}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={55}
                                                    outerRadius={75}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {categoryBreakdown.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip 
                                                    contentStyle={{
                                                        backgroundColor: "var(--card)",
                                                        border: "1px solid var(--border)",
                                                        borderRadius: "8px",
                                                        fontSize: "11px"
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    {/* Custom legend for categories */}
                                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2 px-2 overflow-y-auto max-h-[70px]">
                                        {categoryBreakdown.map((item, index) => (
                                            <div key={item.name} className="flex items-center gap-1.5 text-xxs font-medium text-muted-foreground">
                                                <span 
                                                    className="h-2 w-2 rounded-full shrink-0" 
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                                                />
                                                <span className="truncate max-w-[75px]">{item.name}</span>
                                                <span className="text-foreground">({item.value})</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Recent ideas feed and Top contributors sidebar widgets */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Ideas */}
                <Card className="lg:col-span-2 border border-border bg-card shadow-sm rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Recent Submissions</CardTitle>
                            <CardDescription className="text-xs">
                                Track stage approval status of your recently submitted ideas.
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-xs font-semibold hover:bg-muted p-2 rounded-md">
                            <Link href="/innovations" className="flex items-center gap-1">
                                View All
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentIdeas.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                                You haven't submitted any ideas yet! Submit a new idea to get started.
                            </div>
                        ) : (
                            recentIdeas.map((idea) => {
                                let statusBadgeColor = "bg-slate-500/10 text-slate-600 border-slate-500/20";
                                if (idea.status === "APPROVED" || idea.status === "IMPLEMENTED") {
                                    statusBadgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                                } else if (idea.status === "REJECTED") {
                                    statusBadgeColor = "bg-destructive/10 text-destructive border-destructive/20";
                                } else if (idea.status === "IN_PROGRESS" || idea.status === "SUBMITTED") {
                                    statusBadgeColor = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
                                }

                                return (
                                    <div 
                                        key={idea.id} 
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-border bg-background/40 hover:bg-background/80 transition-colors gap-3"
                                    >
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-bold text-foreground line-clamp-1 leading-snug">
                                                {idea.title}
                                            </h4>
                                            <div className="flex items-center gap-3 text-xxs text-muted-foreground font-medium">
                                                <span className="bg-muted px-2 py-0.5 rounded-md">{idea.category || "General"}</span>
                                                <span className="flex items-center gap-1 text-muted-foreground/60">
                                                    <Calendar className="h-3 w-3" />
                                                    {idea.createdAt}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-3">
                                            <Badge variant="outline" className={`text-xxs px-2.5 py-0.5 font-bold uppercase ${statusBadgeColor}`}>
                                                {idea.status.toLowerCase().replace("_", " ")}
                                            </Badge>
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:bg-muted p-0 rounded-md shrink-0">
                                                <Link href={`/innovations/${idea.id}`}>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                {/* Top Contributors quick dashboard view */}
                <Card className="border border-border bg-card shadow-sm rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Top Contributors</CardTitle>
                            <CardDescription className="text-xs">
                                Current standing leaders.
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-xs font-semibold hover:bg-muted p-2 rounded-md">
                            <Link href="/leaderboard" className="flex items-center gap-1">
                                View Leaderboard
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {topContributors.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                                No records currently logged.
                            </div>
                        ) : (
                            topContributors.map((item, index) => {
                                const rank = index + 1;
                                let rankBadge = <span className="text-xs font-bold text-muted-foreground">{rank}</span>;
                                if (rank === 1) rankBadge = <Trophy className="h-4.5 w-4.5 text-yellow-500 fill-yellow-500/10" />;
                                else if (rank === 2) rankBadge = <Medal className="h-4.5 w-4.5 text-slate-400" />;
                                else if (rank === 3) rankBadge = <Medal className="h-4.5 w-4.5 text-amber-600" />;

                                return (
                                    <div 
                                        key={item.userId} 
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 flex items-center justify-center shrink-0">
                                                {rankBadge}
                                            </div>
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                                    {getInitials(item.fullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-bold text-xs text-foreground line-clamp-1">{item.fullName}</span>
                                        </div>
                                        <span className="text-xs font-extrabold text-muted-foreground whitespace-nowrap">
                                            {item.points} pts
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Motivational Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 dark:border-indigo-500/15 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground flex items-center justify-center md:justify-start gap-1.5">
                        <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                        Have an idea that could improve safety, quality, or process?
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Submit it today! Approved ideas gain points and contribute to your team standings.
                    </p>
                </div>
                <Link 
                    href="/innovations/new" 
                    className="inline-flex items-center bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer hover:shadow-md shrink-0"
                >
                    Submit New Idea
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Link>
            </div>
        </div>
    );
}

// Inline fallback chevron icon
function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
