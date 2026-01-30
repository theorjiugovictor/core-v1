'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign } from 'lucide-react';

interface DailySummaryProps {
    sales: any[];
    expenses: any[];
}

export function DailySummary({ sales, expenses }: DailySummaryProps) {
    const today = new Date().toISOString().split('T')[0];

    const todaySales = sales.filter(s => s.date.startsWith(today));
    const todayExpenses = expenses.filter(e => e.date.startsWith(today));

    const totalSales = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalExpensesAmount = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    // Rough daily net (Sales - Expenses). Doesn't account for COGS perfectly here but gives a good snapshot.
    const dailyNet = totalSales - totalExpensesAmount;

    return (
        <Card className="bg-gradient-to-r from-background to-secondary/10 border-l-4 border-l-primary">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Today's Overview
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">{format(new Date(), 'MMM do, yyyy')}</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Sales</p>
                        <p className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                            {todaySales.length > 0 && <ArrowUpRight className="h-4 w-4" />}
                            ₦{totalSales.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{todaySales.length} transactions</p>
                    </div>
                    <div className="border-l border-r border-border/50">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Expenses</p>
                        <p className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                            {todayExpenses.length > 0 && <ArrowDownRight className="h-4 w-4" />}
                            ₦{totalExpensesAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{todayExpenses.length} records</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Net Flow</p>
                        <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${dailyNet >= 0 ? 'text-primary' : 'text-red-500'}`}>
                            {dailyNet >= 0 ? '+' : ''}₦{dailyNet.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Cash flow</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
