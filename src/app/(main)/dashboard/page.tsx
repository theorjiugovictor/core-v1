import { Suspense } from 'react';
import { PromptConsole } from "@/components/prompt-console";
import { KpiSection } from "@/components/kpi-section";
import { RevenueChart } from "@/components/revenue-chart";
import { getKpisAction, getRevenueChartData, getSalesAction, getExpensesAction } from "@/lib/actions";
import { DashboardInsights } from "@/components/dashboard-insights";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { OnboardingTour } from "@/components/onboarding-tour";
import { DailySummary } from "@/components/daily-summary";

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
    const [kpis, revenueData, sales, expenses] = await Promise.all([
        getKpisAction('month'),
        getRevenueChartData(),
        getSalesAction(),
        getExpensesAction(),
    ]);

    // Detect new users — no sales, no expenses, no materials recorded yet
    const hasData = sales.length > 0 || expenses.length > 0;

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* 1. CORE Assistant */}
            <section className="relative z-10">
                <PromptConsole hasData={hasData} />
            </section>

            {/* 2. KPI Section with period toggle */}
            <KpiSection initialKpis={kpis} initialPeriod="month" />

            {/* 3. Daily Summary */}
            <section>
                <DailySummary sales={sales} expenses={expenses} />
            </section>

            {/* 4. Deep Insights & Visuals Layer - Bento Grid Row 2 */}
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
