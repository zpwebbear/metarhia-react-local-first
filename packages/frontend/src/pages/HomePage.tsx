import { AppLayout } from '@/components/layout/AppLayout'
import { MonthlySummaryWidget } from '@/widgets/home/MonthlySummaryWidget'
import { MonthlySummaryExpensesWidget } from '@/widgets/home/MonthlySummaryExpensesWidget'
import { AddExpenseButton } from '@/components/home/AddExpenseButton'

export function HomePage() {

  const handleAddExpense = () => {
    console.log('Navigate to add expense')
    // TODO: Navigate to add expense page
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Monthly Summary */}
        <MonthlySummaryWidget />

        {/* Add Expense Button */}
        <AddExpenseButton onAdd={handleAddExpense} />

        {/* Monthly Expenses */}
        <MonthlySummaryExpensesWidget />
      </div>
    </AppLayout>
  )
}
