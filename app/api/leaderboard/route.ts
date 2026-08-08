import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard";

export async function GET() {
    try {
        const token = (await cookies()).get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET!);

        const leaderboardData = await getLeaderboard();
        return NextResponse.json({ success: true, data: leaderboardData });
    } catch (err) {
        console.error("Leaderboard GET Error:", err);
        return NextResponse.json(
            { error: "Failed to fetch leaderboard rankings" },
            { status: 500 }
        );
    }
}
