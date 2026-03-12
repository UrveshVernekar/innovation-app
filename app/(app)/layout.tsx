import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken";
import Sidebar from "@/components/layout/sidebar"

interface JwtPayload {
    userId: number;
    username: string;
    role: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    companyID: number
    factoryID: number
    departmentID: number
}

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        redirect("/login")
    }

    let user: { fullName?: string; firstName?: string; lastName?: string } = {};

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        // Combine first + last name (fallback gracefully)
        const fullName =
            [decoded.firstName, decoded.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() || decoded.username || "User";

        user = { fullName, firstName: decoded.firstName, lastName: decoded.lastName };
    } catch (err) {
        console.error("Invalid token in layout", err);
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen bg-muted/30">
            <Sidebar userFullName={user.fullName} />
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    )
}