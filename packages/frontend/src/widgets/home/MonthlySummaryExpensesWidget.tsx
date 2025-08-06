import { useQuery } from '@tanstack/react-query'
import { fetchExpenses } from '@/services/expenses'
import { getCurrentMonthDateRange, getCurrentMonthLabel } from '@/utils/date'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ExpenseList } from '@/components/home/ExpenseList'

export function MonthlySummaryExpensesWidget() {
  const currentMonthRange = getCurrentMonthDateRange()
  const currentMonthLabel = getCurrentMonthLabel()

  const {
    data: expenses,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['expenses', 'current-month', currentMonthRange.from, currentMonthRange.to],
    queryFn: () => fetchExpenses({
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
            {currentMonthLabel} Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-muted-foreground">
            {currentMonthLabel} Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-destructive">
            Failed to load expenses
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

  const allExpenses = expenses || []

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-muted-foreground">
          {currentMonthLabel} Expenses
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {allExpenses.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <p className="text-sm">No expenses this month</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-1">
            <ExpenseList 
              expenses={allExpenses}
              showViewAllButton={false}
              title="All Expenses"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
