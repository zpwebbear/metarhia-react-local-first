export interface StatisticsResponse {
  total: number
  categories: Array<{
    categoryId: number
    categoryName: string
    amount: number
  }>
}

export interface StatisticsParams {
  from?: string // YYYY-MM-DD format
  to?: string // YYYY-MM-DD format
  categoryId?: number
}

const API_BASE_URL = 'http://localhost:3000'

export async function fetchStatistics(params?: StatisticsParams): Promise<StatisticsResponse> {
  const url = new URL('/statistics', API_BASE_URL)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString())
      }
    })
  }

  const response = await fetch(url.toString())
  
  if (!response.ok) {
    throw new Error(`Failed to fetch statistics: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
