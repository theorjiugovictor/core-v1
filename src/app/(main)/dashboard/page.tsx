import { KpiCard } from "@/components/kpi-card";
import { PromptConsole } from "@/components/prompt-console";
import { RevenueChart } from "@/components/revenue-chart";
import { mockKpis } from "@/lib/data";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { getBusinessInsights } from "@/lib/actions";
import { Lightbulb } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
    const insightsResult = await getBusinessInsights();

    return (
        <div className="flex flex-col gap-4 md:gap-8">
            <PromptConsole />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {mockKpis.map((kpi) => (
                    <KpiCard key={kpi.title} {...kpi} />
                ))}
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <RevenueChart />
                </div>
                <Card>
                    <CardHeader className="flex flex-row items-center">
                        <div className="grid gap-2">
                        <CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5"/> Quick Insights</CardTitle>
                        <CardDescription>
                            AI-powered suggestions for your business.
                        </CardDescription>
                        </div>
                        <Button asChild size="sm" className="ml-auto gap-1">
                        <Link href="/insights">
                            View All
                        </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {insightsResult.success && insightsResult.data ? (
                             insightsResult.data.slice(0, 3).map((insight) => (
                                <div key={insight.message} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Lightbulb className="h-4 w-4" />
                                    </div>
                                    <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">
                                        {insight.message}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Relevance: {(insight.relevanceScore * 100).toFixed(0)}%
                                    </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">{insightsResult.error}</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
