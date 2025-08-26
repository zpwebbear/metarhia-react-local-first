import { app } from '@/application/domain'
import type { Category } from '@/types'

export async function fetchCategories(): Promise<Category[]> {
  return app.categories
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
  return app.createCategory(category)
}

export async function updateCategory(id: string, category: Partial<Omit<Category, 'id'>>): Promise<Category> {
  return app.editCategory(id, category)
}
