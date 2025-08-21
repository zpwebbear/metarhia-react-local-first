import { ExpenseList } from '@/components/home/ExpenseList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApplicationStore } from '@/store/use-application-store';

export function MonthlySummaryExpensesWidget() {

  const expenses = useApplicationStore((state) => state.currentMonthExpenses);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-muted-foreground">
          Expenses ({expenses.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {expenses.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <p className="text-sm">No expenses this month</p>
          </div>
        ) : (
          <ExpenseList
            expenses={expenses}
          />
        )}
      </CardContent>
    </Card>
  )
}
