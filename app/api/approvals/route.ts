import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { processApproval } from "@/lib/approvals";

type JwtPayload = {
    userId: number
    companyID: number
    factoryID: number
    departmentID: number
}

export async function POST(req: Request) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as JwtPayload;

    const { ideaId, action, comments } = await req.json();

    await processApproval({
        ideaId,
        approverId: decoded.userId,
        action,
        comments
    });

    return NextResponse.json({ success: true });
}