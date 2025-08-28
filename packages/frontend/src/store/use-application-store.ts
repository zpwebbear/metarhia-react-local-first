import { app } from '@/application/domain';
import type { ApplicationStore, Category, CategoryFilters, Expense, Filters } from '@/types';
import { create } from 'zustand';

const getApplicationState = () => ({
  expenses: app.expenses as Expense[],
  categories: app.categories as Category[],
  currentMonthSummary: app.currentMonthSummary,
  isConnected: app.connected,
  online: app.online,
  prompt: app.prompt,
  currentMonthExpenses: app.currentMonthExpenses as Expense[],
});

const getFiltersState = () => ({
  categoryId: null,
  from: null,
  to: null,
});

const getCategoryFiltersState = () => ({
  from: null,
  to: null,
});

const useApplicationStore = create<ApplicationStore>((set) => ({
  ...getApplicationState(),
  filters: getFiltersState(),
  setFilters: (newFilters: Partial<Filters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },
  resetFilters: () => {
    set(() => ({
      filters: getFiltersState(),
    }));
  },
  categoryFilters: getCategoryFiltersState(),
  setCategoryFilters: (newFilters: Partial<CategoryFilters>) => {
    set((state) => ({
      categoryFilters: { ...state.categoryFilters, ...newFilters },
    }));
  },
  resetCategoryFilters: () => {
    set(() => ({
      categoryFilters: getCategoryFiltersState(),
    }));
  },
  createExpense: (dto: any) => app.createExpense(dto),
  createCategory: (dto: any) => app.createCategory(dto),
  editExpense: (id: string, dto: Partial<Omit<Expense, 'id'>>) => app.editExpense(id, dto),
  editCategory: (id: string, dto: Partial<Omit<Category, 'id'>>) => app.editCategory(id, dto),
  clearDatabase: () => app.clearDatabase(),
  updateCache: () => app.updateCache(),
  filterExpenses: (filters: Partial<Filters>) => app.filterExpenses(filters),
  filterCategories: (filters: Partial<CategoryFilters>) => app.filterCategories(filters),
  getStatistics: (filters: Partial<Filters>) => app.getStatistics(filters),
}));

const syncStateWithStore = () => {
  useApplicationStore.setState(getApplicationState());
};

app.on('stateSet', syncStateWithStore);
app.on('deltaSet', syncStateWithStore);
app.on('stateCleared', syncStateWithStore);
app.on('databaseCleared', syncStateWithStore);
app.on('status', syncStateWithStore);
app.on('network', syncStateWithStore);
app.on('install', syncStateWithStore);

export { useApplicationStore };
