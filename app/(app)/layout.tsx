import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import AppLayoutClient from "@/components/layout/AppLayoutClient";

interface JwtPayload {
    userId: number;
    username: string;
    role: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    companyID: number;
    factoryID: number;
    departmentID: number;
    department?: string;
}

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        redirect("/login");
    }

    let user: { fullName: string; role: string } = { fullName: "User", role: "Employee" };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        // Combine first + last name (fallback gracefully)
        const fullName =
            [decoded.firstName, decoded.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() || decoded.username || "User";

        const role = decoded.role || decoded.department || "Employee";

        user = { fullName, role };
    } catch (err) {
        console.error("Invalid token in layout", err);
        redirect("/login");
    }

    return (
        <AppLayoutClient user={user}>
            {children}
        </AppLayoutClient>
    );
}