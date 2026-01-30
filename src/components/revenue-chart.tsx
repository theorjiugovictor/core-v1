'use client';

import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';


export type RevenueData = {
  date: string;
  Desktop: number;
  Mobile: number;
};

export function RevenueChart({ data }: { data: RevenueData[] }) {
  // Simple check if there's an increase this month compared to last
  const thisMonth = data[data.length - 1]?.Desktop || 0;
  const lastMonth = data[data.length - 2]?.Desktop || 0;
  const percentageChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
  const isTrendingUp = percentageChange >= 0;

  return (
    <Card className="h-full border-none shadow-lg bg-card/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="font-heading text-lg">Revenue Trend</CardTitle>
        <CardDescription>Performance over last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                left: 0,
                right: 0,
                top: 10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => value.slice(0, 3)}
                className="text-xs text-muted-foreground"
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                dataKey="Desktop"
                type="monotone"
                fill="url(#fillRevenue)"
                fillOpacity={1}
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className={`flex items-center gap-2 font-medium leading-none ${isTrendingUp ? 'text-green-600' : 'text-red-500'}`}>
              {isTrendingUp ? 'Trending up' : 'Trending down'} by {Math.abs(percentageChange).toFixed(1)}% this month <TrendingUp className={`h-4 w-4 ${!isTrendingUp && 'rotate-180'}`} />
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
