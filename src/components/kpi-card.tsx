import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Kpi } from "@/lib/types"
import { cn } from "@/lib/utils"

export function KpiCard({ title, value, change, changeType, icon: Icon, description }: Kpi) {
  return (
    <Card className="overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur-md transition-all hover:bg-card/80 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-heading tracking-tight">{value}</div>
        {change && (
          <p className={cn(
            "text-xs font-medium mt-1 flex items-center gap-1",
            changeType === 'increase' && 'text-green-600',
            changeType === 'decrease' && 'text-red-500'
          )}>
            <span>{changeType === 'increase' ? '↑' : '↓'} {change}</span>
            <span className="text-muted-foreground font-normal opacity-80">{description}</span>
          </p>
        )}
        {!change && description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
