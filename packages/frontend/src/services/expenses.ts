import { app } from '@/application/domain'
import type { Expense, ExpenseFilters } from '@/types'

export async function fetchExpenses(filters: ExpenseFilters = {categoryId: null, from: null, to: null}): Promise<Expense[]> {

  return app.filterExpenses(filters)
}

export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'category'> & { categoryId: string }): Promise<Expense> {
  return app.createExpense(expense)
}


export async function updateExpense(id: number, expense: Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'category'> & { categoryId: string }>): Promise<Expense> {
  return app.editExpense(id, expense)
}
