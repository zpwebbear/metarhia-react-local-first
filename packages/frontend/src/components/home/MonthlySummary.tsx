import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MonthlySummaryProps {
  month: string
  total: number
}

export function MonthlySummary({ month, total }: MonthlySummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-muted-foreground">
          {month} Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold">${total.toFixed(2)}</div>
        <p className="text-sm text-muted-foreground mt-1">
          Total expenses this month
        </p>
      </CardContent>
    </Card>
  )
}
