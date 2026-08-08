// app/(app)/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { 
    getUserDashboardStats, 
    getDashboardChartData, 
    getCategoryBreakdown, 
    getDashboardTopContributors, 
    getDashboardRecentIdeas 
} from "@/lib/dashboard";
import DashboardClient from "@/components/dashboard/DashboardClient";

interface TokenPayload {
    userId: number;
    factoryID: number;
    companyID: number;
    role: string;
    firstName?: string;
    lastName?: string;
    username: string;
}

export default async function Dashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        redirect("/login");
    }

    let decoded: TokenPayload;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    } catch (err) {
        console.error("Invalid token on dashboard", err);
        redirect("/login");
    }

    // Load dashboard stats
    const stats = await getUserDashboardStats(decoded.userId);
    const chartData = await getDashboardChartData(decoded.userId);
    const categoryBreakdown = await getCategoryBreakdown(decoded.userId);
    const topContributors = await getDashboardTopContributors();
    const recentIdeas = await getDashboardRecentIdeas(decoded.userId);

    const fullName = [decoded.firstName, decoded.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || decoded.username || "User";

    const safeStats = {
        totalIdeas: stats?.totalIdeas ?? 0,
        pendingIdeas: stats?.pendingIdeas ?? 0,
        approvedIdeas: stats?.approvedIdeas ?? 0,
        totalPoints: stats?.totalPoints ?? 0,
    };

    return (
        <DashboardClient
            userFullName={fullName}
            stats={safeStats}
            chartData={chartData}
            categoryBreakdown={categoryBreakdown}
            topContributors={topContributors}
            recentIdeas={recentIdeas}
        />
    );
}