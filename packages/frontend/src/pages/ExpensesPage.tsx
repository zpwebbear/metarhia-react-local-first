import { AppLayout } from '@/components/layout/AppLayout'
import { ExpensesWidget } from '@/widgets/expenses/ExpensesWidget'

export function ExpensesPage() {
  return (
    <AppLayout title="Expenses">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">All Expenses</h1>
        <ExpensesWidget />
      </div>
    </AppLayout>
  )
}
