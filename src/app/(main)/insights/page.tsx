import { getBusinessInsights } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, RefreshCw } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function InsightsPage() {
    const insightsResult = await getBusinessInsights();

    async function refreshInsights() {
        'use server';
        revalidatePath('/insights');
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div></div>
                <form action={refreshInsights}>
                    <Button>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate New Insights
                    </Button>
                </form>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {insightsResult.success && insightsResult.data ? (
                    insightsResult.data.map((insight, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Lightbulb className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-base font-semibold">Suggestion</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">{insight.message}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Relevance Score: {(insight.relevanceScore * 100).toFixed(0)}%
                                </p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="col-span-full">
                        <CardHeader>
                            <CardTitle>Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{insightsResult.error}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div >
    );
}
