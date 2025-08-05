export interface Expense {
  id: number
  name: string
  amount: number
  category: string
  date: string
  description?: string
}

export interface Category {
  id: number
  name: string
  color?: string
}

export interface ExpenseFilters {
  categoryId?: number
  startDate?: string
  endDate?: string
  search?: string
}

export interface StatisticsData {
  totalAmount: number
  categoryBreakdown: Array<{
    category: string
    amount: number
    count: number
  }>
  monthlyTrend: Array<{
    month: string
    amount: number
  }>
}
