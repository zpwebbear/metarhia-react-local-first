import { AppLayout } from '@/components/layout/AppLayout'
import { StatisticsWidget } from '@/widgets/statistics/StatisticsWidget'

export function StatisticsPage() {
  return (
    <AppLayout title="Statistics">
      <div className="space-y-6">
        <StatisticsWidget />
      </div>
    </AppLayout>
  )
}
