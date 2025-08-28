import type { StatisticsResponse } from "@/services/statistics"

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
  categoryId?: string
  from?: string  // YYYY-MM-DD format
  to?: string    // YYYY-MM-DD format
  search?: string
}

export interface Filters {
  categoryId?: string | null;
  from?: string | null;
  to?: string | null;
}

export interface CategoryFilters {
  from?: string | null;
  to?: string | null;
}

export interface ApplicationStore {
  // State
  expenses: Expense[];
  categories: Category[];
  isConnected: boolean;
  filters: Filters;
  categoryFilters: CategoryFilters;
  prompt: Event | null; 
  currentMonthSummary: number;
  currentMonthExpenses: Expense[];
  online: boolean;

  // Actions
  setFilters: (newFilters: Partial<Filters>) => void;
  resetFilters: () => void;
  setCategoryFilters: (newFilters: Partial<CategoryFilters>) => void;
  resetCategoryFilters: () => void;
  createExpense: (dto: Omit<Expense, 'id'>) => void;
  createCategory: (dto: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => void;
  editExpense: (id: string, dto: Partial<Omit<Expense, 'id'>>) => void;
  editCategory: (id: string, dto: Partial<Omit<Category, 'id'>>) => void; 

  // Queries
  filterExpenses: (filters: Filters) => Expense[];
  getStatistics: (filters: Filters) => StatisticsResponse | null;
  filterCategories: (filters: CategoryFilters) => Category[];
}
