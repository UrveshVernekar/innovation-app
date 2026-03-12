// app/login/page.tsx  (or wherever your login is)

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, User } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, dbName: "org_db" }),
            })

            if (res.ok) {
                router.replace("/")
                router.refresh()
            } else {
                const data = await res.json().catch(() => ({}))
                setError(data.message || "Invalid username or password")
            }
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
            <Card className="w-full max-w-md border border-border bg-card shadow-2xl shadow-black/5 dark:shadow-black/40 rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="flex items-center justify-center gap-3">
                            <div className="text-4xl font-black text-primary">IFB</div>
                            <div className="text-4xl font-semibold text-muted-foreground">Innovation</div>
                        </div>

                        <p className="text-sm text-muted-foreground font-medium">
                            Employee Innovation Portal
                        </p>

                        <p className="text-xs text-muted-foreground/80">
                            Share ideas • Drive improvement • Shape IFB future
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="username" className="text-muted-foreground font-medium text-sm">
                                Username
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                                <Input
                                    id="username"
                                    placeholder="Enter your username"
                                    className="pl-10 h-10 text-sm bg-background border-input focus:border-primary focus:ring-primary/30"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-muted-foreground font-medium text-sm">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-10 text-sm bg-background border-input focus:border-primary focus:ring-primary/30"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-3 py-2.5 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-10 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-4 w-4 text-current"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="text-center space-y-2 pt-2">
                        <p className="text-xs text-muted-foreground">
                            Don’t have access? Contact your plant HR / IT admin
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                            © 2026 IFB Industries Ltd.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}