import { Suspense } from 'react';
import { KpiCard } from "@/components/kpi-card";
import { PromptConsole } from "@/components/prompt-console";
import { RevenueChart } from "@/components/revenue-chart";
import { getKpisAction, getRevenueChartData } from "@/lib/actions";
import { Activity, DollarSign, Package, TrendingDown, TrendingUp, Boxes } from "lucide-react";
import { DashboardInsights } from "@/components/dashboard-insights";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { OnboardingTour } from "@/components/onboarding-tour";

const iconMap = {
    DollarSign,
    Package,
    TrendingUp,
    TrendingDown,
    Activity,
    Boxes
};

function DashboardInsightsSkeleton() {
    return (
        <Card className="h-full border-none shadow-lg bg-gradient-to-br from-card to-secondary/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 font-heading text-lg">
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <Skeleton className="w-24 h-6" />
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 p-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export default async function DashboardPage() {
    // Parallelize fast data fetching
    const [kpis, revenueData] = await Promise.all([
        getKpisAction(),
        getRevenueChartData()
    ]);

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
                <Suspense fallback={<DashboardInsightsSkeleton />}>
                    <DashboardInsights />
                </Suspense>
            </section>

            <OnboardingTour />
        </div>
    );
}
