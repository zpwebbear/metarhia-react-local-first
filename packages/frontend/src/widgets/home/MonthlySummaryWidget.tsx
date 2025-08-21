import { MonthlySummary } from '@/components/home/MonthlySummary'
import { useApplicationStore } from '@/store/use-application-store';
import { getCurrentMonthLabel } from '@/utils/date'

export function MonthlySummaryWidget() {
  const currentMonthLabel = getCurrentMonthLabel()

  const total = useApplicationStore((state) => state.currentMonthSummary);

  return (
    <MonthlySummary 
      month={currentMonthLabel}
      total={total}
    />
  )
}
