import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Kpi } from "@/lib/types"
import { cn } from "@/lib/utils"

export function KpiCard({ title, value, change, changeType, icon: Icon, description }: Kpi) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
             <p className={cn(
                "text-xs text-muted-foreground",
                changeType === 'increase' && 'text-green-600',
                changeType === 'decrease' && 'text-red-600'
             )}>
                {change} {description}
            </p>
        )}
        {!change && description && (
            <p className="text-xs text-muted-foreground">
                {description}
            </p>
        )}
      </CardContent>
    </Card>
  )
}
