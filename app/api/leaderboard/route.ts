import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard";

export async function GET(req: Request) {
    try {
        const token = (await cookies()).get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET!);

        // Parse date range parameter
        const { searchParams } = new URL(req.url);
        const range = (searchParams.get("range") || "all") as "month" | "quarter" | "all";

        // Validate range values
        if (range !== "month" && range !== "quarter" && range !== "all") {
            return NextResponse.json({ error: "Invalid range value" }, { status: 400 });
        }

        const leaderboardData = await getLeaderboard(range);
        return NextResponse.json({ success: true, data: leaderboardData });
    } catch (err) {
        console.error("Leaderboard GET Error:", err);
        return NextResponse.json(
            { error: "Failed to fetch leaderboard rankings" },
            { status: 500 }
        );
    }
}
