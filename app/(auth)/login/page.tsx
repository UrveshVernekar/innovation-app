import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import LoginClient from "./LoginClient"

export default async function LoginPage() {
    const token = (await cookies()).get("token")?.value

    if (token) {
        redirect("/")
    }

    return <LoginClient />
}