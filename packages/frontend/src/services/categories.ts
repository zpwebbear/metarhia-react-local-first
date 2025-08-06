import type { Category } from '@/types'

const API_BASE_URL = 'http://localhost:3000'

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function fetchCategoryById(id: number): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch category: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to create category: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function updateCategory(id: number, category: Partial<Omit<Category, 'id'>>): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to update category: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error(`Failed to delete category: ${response.status} ${response.statusText}`)
  }
}
