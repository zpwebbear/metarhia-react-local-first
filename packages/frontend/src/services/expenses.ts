import type { Expense, ExpenseFilters } from '@/types'

const API_BASE_URL = 'http://localhost:3000'

export async function fetchExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
  const url = new URL('/expenses', API_BASE_URL)
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString())
      }
    })
  }

  const response = await fetch(url.toString())
  
  if (!response.ok) {
    throw new Error(`Failed to fetch expenses: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function fetchExpenseById(id: number): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch expense: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'category'> & { categoryId: number }): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expense),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to create expense: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function updateExpense(id: number, expense: Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'category'> & { categoryId: number }>): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expense),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to update expense: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function deleteExpense(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error(`Failed to delete expense: ${response.status} ${response.statusText}`)
  }
}