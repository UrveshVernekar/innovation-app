// components/dashboard/kpi-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    description: string;
    trend?: "up" | "down" | "neutral";
    highlight?: boolean;
    href?: string;
}

export default function KpiCard({
    icon,
    title,
    value,
    description,
    highlight = false,
    href,
}: Props) {
    const cardContent = (
        <Card
            className={cn(
                "overflow-hidden transition-all duration-300",
                href 
                    ? "cursor-pointer hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 active:translate-y-0" 
                    : "hover:shadow-md",
                highlight && "border-primary/40 bg-primary/5 dark:bg-primary/10"
            )}
        >
            <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="rounded-lg bg-muted/60 p-3">{icon}</div>
                </div>

                <div className="mt-5 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground/90 leading-relaxed">
                        {description}
                    </p>
                </div>
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block select-none">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}