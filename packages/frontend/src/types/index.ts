export interface Expense {
  id: number
  name: string
  amount: number
  category: {
    id: number
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
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface ExpenseFilters {
  categoryId?: number
  from?: string  // YYYY-MM-DD format
  to?: string    // YYYY-MM-DD format
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
