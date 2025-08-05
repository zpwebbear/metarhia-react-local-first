import { useQuery } from '@tanstack/react-query'
import { MonthlySummary } from '@/components/home/MonthlySummary'
import { fetchStatistics } from '@/services/statistics'
import { getCurrentMonthDateRange, getCurrentMonthLabel } from '@/utils/date'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function MonthlySummaryWidget() {
  const currentMonthRange = getCurrentMonthDateRange()
  const currentMonthLabel = getCurrentMonthLabel()

  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['statistics', 'current-month', currentMonthRange.from, currentMonthRange.to],
    queryFn: () => fetchStatistics({
      from: currentMonthRange.from,
      to: currentMonthRange.to
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes - data doesn't change frequently
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-muted-foreground">
            {currentMonthLabel} Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-muted-foreground">
            {currentMonthLabel} Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-destructive">
            Failed to load monthly summary
            {error instanceof Error && (
              <div className="text-xs text-muted-foreground mt-1">
                {error.message}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <MonthlySummary 
      month={currentMonthLabel}
      total={data?.total || 0}
    />
  )
}
