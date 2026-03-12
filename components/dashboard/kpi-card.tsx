// components/dashboard/kpi-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    description: string;
    trend?: "up" | "down" | "neutral";
    highlight?: boolean;
}

export default function KpiCard({
    icon,
    title,
    value,
    description,
    // trend = "neutral",
    highlight = false,
}: Props) {
    return (
        <Card
            className={cn(
                "overflow-hidden transition-all hover:shadow-md",
                highlight && "border-primary/40 bg-primary/5 dark:bg-primary/10"
            )}
        >
            <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="rounded-lg bg-muted/60 p-3">{icon}</div>
                    {/* Optional trend indicator - can be dynamic later */}
                    {/* {trend !== "neutral" && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend === "up" ? "text-green-600" : "text-red-600"
              )}
            >
              {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              12%
            </div>
          )} */}
                </div>

                <div className="mt-5 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                    <p className="text-xs text-muted-foreground/90 leading-relaxed">
                        {description}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}