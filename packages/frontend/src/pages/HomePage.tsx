import { AppLayout } from '@/components/layout/AppLayout'
import { MonthlySummaryWidget } from '@/widgets/home/MonthlySummaryWidget'
import { MonthlySummaryExpensesWidget } from '@/widgets/home/MonthlySummaryExpensesWidget'
import { AddExpenseWidget } from '@/widgets/home/AddExpenseWidget'

export function HomePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Monthly Summary */}
        <MonthlySummaryWidget />

        {/* Add Expense Widget */}
        <AddExpenseWidget />

        {/* Monthly Expenses */}
        <MonthlySummaryExpensesWidget />
      </div>
    </AppLayout>
  )
}
