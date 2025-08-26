export interface Expense {
  id: string
  name: string
  amount: number
  category: {
    id: string
    name: string
    created_at: string
    updated_at: string
  }
  date: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface ExpenseFilters {
  categoryId?: string | null
  from?: string | null
  to?: string | null
  search?: string | null
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
