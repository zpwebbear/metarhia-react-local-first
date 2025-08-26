import { app } from "@/application/domain"

export interface StatisticsResponse {
  total: number
  categories: Array<{
    categoryId: string
    categoryName: string
    amount: number
  }>
}

export interface StatisticsParams {
  from?: string // YYYY-MM-DD format
  to?: string // YYYY-MM-DD format
  categoryId?: number
}

export async function fetchStatistics(params?: StatisticsParams): Promise<StatisticsResponse> {
  return app.getStatistics(params)
}
