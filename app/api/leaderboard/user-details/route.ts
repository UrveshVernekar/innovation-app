import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { getUserLeaderboardDetails } from "@/lib/leaderboard";

export async function GET(req: Request) {
    try {
        const token = (await cookies()).get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET!);

        // Parse user ID parameter
        const { searchParams } = new URL(req.url);
        const userIdStr = searchParams.get("userId");

        if (!userIdStr) {
            return NextResponse.json({ error: "userId parameter is required" }, { status: 400 });
        }

        const userId = Number(userIdStr);
        if (isNaN(userId)) {
            return NextResponse.json({ error: "Invalid userId parameter" }, { status: 400 });
        }

        const details = await getUserLeaderboardDetails(userId);
        return NextResponse.json({ success: true, ...details });
    } catch (err) {
        console.error("Leaderboard Details GET Error:", err);
        return NextResponse.json(
            { error: "Failed to fetch user points history and recent ideas" },
            { status: 500 }
        );
    }
}
