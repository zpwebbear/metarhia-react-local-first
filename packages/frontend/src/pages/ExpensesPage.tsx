import { AppLayout } from '@/components/layout/AppLayout'

export function ExpensesPage() {
  return (
    <AppLayout title="Expenses">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">All Expenses</h1>
        {/* TODO: Add expenses filtering and list components */}
        <p className="text-muted-foreground">
          This page will show all expenses with filtering options.
        </p>
      </div>
    </AppLayout>
  )
}
