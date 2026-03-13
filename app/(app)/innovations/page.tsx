import React from 'react'
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getUserInnovations } from '@/lib/innovations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import InnovationTable from '@/components/innovations/innovation-table';

type JwtPayload = {
    userId: number;
    companyID: number;
    factoryID: number;
    departmentID: number;
};

export default async function InnovationsPage() {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null;
    let decoded: JwtPayload;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch {
        return null;
    }

    const innovations = await getUserInnovations(decoded.userId);

    return (
        <div>
            <Card className="border-none shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Your Ground-breaking Ideas!</CardTitle>
                    <CardDescription>
                        {innovations.length === 0
                            ? "We are yet to receive some intuitive ideas from you."
                            : `Showing ${innovations.length} idea${innovations.length !== 1 ? "s" : ""}`}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <InnovationTable innovations={innovations} />
                </CardContent>
            </Card>
        </div>
    )
}