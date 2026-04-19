import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  description?: string;
  icon: React.ElementType;
}

export function KpiCard({ title, value, change, changeType, description, icon: Icon }: KpiCardProps) {
  const isNegative = changeType === 'decrease' && value.startsWith('₦-');
  const isExpense = changeType === 'decrease' && !isNegative;

  return (
    <Card className={cn(
      "overflow-hidden border shadow-sm transition-all hover:shadow-md group",
      isNegative
        ? "border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10"
        : "border-border/60 bg-card"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn(
          "p-1.5 rounded-lg transition-all",
          isNegative
            ? "bg-red-100 dark:bg-red-900/30 text-red-500"
            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
        )}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className={cn(
          "text-2xl font-bold tracking-tight",
          isNegative ? "text-red-600 dark:text-red-400" : "text-foreground"
        )}>
          {value}
        </div>
        {change && (
          <p className={cn(
            "text-xs mt-1.5 flex items-center gap-1",
            changeType === 'increase' && "text-emerald-600 dark:text-emerald-400",
            changeType === 'decrease' && isNegative && "text-red-500",
            changeType === 'decrease' && !isNegative && "text-muted-foreground",
            !changeType && "text-muted-foreground"
          )}>
            {changeType === 'increase' && <span>↑</span>}
            {changeType === 'decrease' && isNegative && <span>↓</span>}
            <span className="font-medium">{change}</span>
            {description && <span className="text-muted-foreground font-normal opacity-75">· {description}</span>}
          </p>
        )}
        {!change && description && (
          <p className="text-xs text-muted-foreground mt-1.5">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
