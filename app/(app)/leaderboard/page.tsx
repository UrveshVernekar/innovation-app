// app/leaderboard/page.tsx  (or wherever it lives)
import { Trophy, Sparkles, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LeaderboardPage() {
    return (
        <div className="container mx-auto max-w-5xl px-4">
            <div className="mx-auto max-w-4xl text-center space-y-10">
                {/* Hero / Visual anchor */}
                <div className="space-y-6">
                    <div className="inline-flex items-center justify-center rounded-full bg-linear-to-br from-amber-100 to-yellow-100 p-5 shadow-sm dark:from-amber-950/40 dark:to-yellow-950/40">
                        <Trophy className="h-12 w-12 text-amber-600 dark:text-amber-500" />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Innovation Leaderboard
                            </h1>
                            <Badge variant="outline" className="text-xs font-normal">
                                Coming Soon
                            </Badge>
                        </div>

                        <p className="text-lg text-muted-foreground md:text-lg leading-relaxed">
                            Recognize and celebrate the most impactful ideas across the organization.
                        </p>
                    </div>
                </div>

                {/* Main message card */}
                <Card className="border shadow-sm">
                    <CardHeader className="space-y-4 pb-6">
                        <CardTitle className="text-2xl">We’re building something exciting</CardTitle>
                        <CardDescription className="text-base">
                            The leaderboard is under active development and will launch soon.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8 pb-8">
                        {/* Benefits / teaser */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-muted/40">
                                <div className="rounded-full bg-primary/10 p-4">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold">See top contributors</h3>
                                <p className="text-sm text-muted-foreground">
                                    Discover who is driving the most valuable innovations
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-muted/40">
                                <div className="rounded-full bg-primary/10 p-4">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold">Cross-factory rankings</h3>
                                <p className="text-sm text-muted-foreground">
                                    Compare performance across departments and factories
                                </p>
                            </div>
                        </div>

                        {/* Timeline / status hint */}
                        <div className="text-center space-y-4 pt-4 border-t">
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button variant="outline" asChild>
                                    <a href="/innovations/new">
                                        Submit New Idea
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>

                                <Button variant="secondary" asChild>
                                    <a href="/innovations">
                                        View My Ideas
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Small motivational footer */}
                <p className="text-sm text-muted-foreground pt-6">
                    Every idea counts — keep innovating! Your next submission might be at the top soon 🚀
                </p>
            </div>
        </div>
    );
}