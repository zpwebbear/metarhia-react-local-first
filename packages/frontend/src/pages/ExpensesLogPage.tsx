import { AppLayout } from '@/components/layout/AppLayout'
import { ExpensesTable } from '@/widgets/expenses/ExpensesTable'

export function ExpensesLogPage() {
  return (
    <AppLayout title="Expenses Log">
      <div className="space-y-6">
        <ExpensesTable />
      </div>
    </AppLayout>
  )
}

