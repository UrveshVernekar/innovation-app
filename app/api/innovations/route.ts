import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { createInnovation } from "@/lib/innovations";

type JwtPayload = {
    userId: number
    companyID: number
    factoryID: number
    departmentID: number
}

export async function POST(req: Request) {
    try {
        const token = (await cookies()).get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as JwtPayload;

        const body = await req.json();

        await createInnovation({
            title: body.title,
            description: body.description,
            expected_benefit: body.expected_benefit,
            category: body.category,
            userId: decoded.userId,
            factoryId: decoded.factoryID,
            companyId: decoded.companyID,
            departmentId: decoded.departmentID,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Failed to create idea" },
            { status: 500 }
        );
    }
}