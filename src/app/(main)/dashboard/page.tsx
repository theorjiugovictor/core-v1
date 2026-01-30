import { KpiCard } from "@/components/kpi-card";
import { PromptConsole } from "@/components/prompt-console";
import { RevenueChart } from "@/components/revenue-chart";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getBusinessInsights, getKpisAction, getRevenueChartData } from "@/lib/actions";
import { ArrowRight, Lightbulb, Sparkles, DollarSign, Package, TrendingUp, TrendingDown, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const iconMap = {
    DollarSign,
    Package,
    TrendingUp,
    TrendingDown,
    Activity
};

export default async function DashboardPage() {
    const insightsResult = await getBusinessInsights();
    const kpis = await getKpisAction();
    const revenueData = await getRevenueChartData();

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* 1. Intelligent Core Layer */}
            <section className="relative z-10">
                <PromptConsole />
            </section>

            {/* 2. Key Metrics Layer - Bento Grid Row 1 */}
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi: any, index: number) => {
                    const IconComponent = iconMap[kpi.iconName as keyof typeof iconMap] || Activity;
                    return (
                        <div key={kpi.title} style={{ animationDelay: `${index * 100}ms` }} className="animate-fade-in-up">
                            <KpiCard {...kpi} icon={IconComponent} />
                        </div>
                    );
                })}
            </section>

            {/* 3. Deep Insights & Visuals Layer - Bento Grid Row 2 */}
            <section className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                {/* Main Chart - Spans 2 cols */}
                <div className="lg:col-span-2 shadow-lg rounded-xl overflow-hidden animate-fade-in-up delay-300">
                    <RevenueChart data={revenueData} />
                </div>

                {/* AI Advisor - Spans 1 col */}
                <Card className="h-full border-none shadow-lg bg-gradient-to-br from-card to-secondary/30 backdrop-blur-md animate-fade-in-up delay-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2 font-heading text-lg">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Business IQ
                            </CardTitle>
                            <CardDescription>AI-generated opportunities</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {insightsResult.success && insightsResult.data ? (
                            insightsResult.data.slice(0, 3).map((insight: any, i: number) => (
                                <div key={i} className="group flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-transparent hover:border-primary/20 transition-all hover:bg-background/80 hover:shadow-sm">
                                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Lightbulb className="h-3 w-3" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-snug">
                                            {insight.message}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-full max-w-[60px] rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${(insight.relevanceScore * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                                {(insight.relevanceScore * 100).toFixed(0)}% Relevant
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                                <p className="text-sm text-muted-foreground">Unable to generate insights at the moment.</p>
                                <Button variant="link" asChild className="mt-2 text-primary">
                                    <Link href="/settings">Check API Keys</Link>
                                </Button>
                            </div>
                        )}
                        <Button asChild size="sm" variant="outline" className="w-full mt-2 gap-2 group border-primary/20 hover:bg-primary/5 hover:text-primary">
                            <Link href="/insights">
                                View Intelligence Report <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
