import { AppLayout } from '@/components/layout/AppLayout'

export function StatisticsPage() {
  return (
    <AppLayout title="Statistics">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Expense Statistics</h1>
        {/* TODO: Add charts and statistics components */}
        <p className="text-muted-foreground">
          This page will show expense statistics and charts.
        </p>
      </div>
    </AppLayout>
  )
}
