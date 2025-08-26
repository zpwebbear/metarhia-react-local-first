import { CategoryForm } from '@/components/categories/CategoryForm'
import { CategoryList } from '@/components/categories/CategoryList'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchCategories } from '@/services/categories'
import { fetchStatistics } from '@/services/statistics'
import type { Category } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { CalendarIcon, FilterIcon, Plus } from 'lucide-react'
import { useState } from 'react'

export function CategoriesWidget() {
  const [filters, setFilters] = useState<{ from?: string; to?: string }>({})
  const [tempFilters, setTempFilters] = useState<{ from?: string; to?: string }>({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Fetch categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorDetails
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes - categories don't change often
  })

  // Fetch statistics for category usage
  const {
    data: statistics,
    isLoading: statisticsLoading
  } = useQuery({
    queryKey: ['statistics', 'category-usage', filters],
    queryFn: () => fetchStatistics(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const handleApplyFilters = () => {
    setFilters(tempFilters)
    setFiltersOpen(false)
  }

  const handleClearFilters = () => {
    const emptyFilters = {}
    setTempFilters(emptyFilters)
    setFilters(emptyFilters)
    setFiltersOpen(false)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
  }

  const handleCloseEdit = () => {
    setEditingCategory(null)
  }

  const handleCreateSuccess = () => {
    setShowCreateForm(false)
  }

  const handleEditSuccess = () => {
    setEditingCategory(null)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '')
  const hasActiveFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length

  // Get category usage from statistics
  const getCategoryUsage = (categoryId: string) => {
    if (!statistics) return 0
    const categoryStats = statistics.categories.find(c => c.categoryId === categoryId)
    return categoryStats?.amount || 0
  }

  const renderFiltersPopover = () => (
    <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <FilterIcon className="size-4" />
          Usage Period
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full size-5 flex items-center justify-center">
              {hasActiveFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filter Category Usage</h4>
            {hasActiveFilters && (
              <Button 
                onClick={handleClearFilters} 
                variant="ghost" 
                size="sm"
                className="text-xs h-6 px-2"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* From Date */}
          <div className="space-y-2">
            <label htmlFor="from-date" className="text-sm font-medium">
              From Date
            </label>
            <div className="relative">
              <Input
                id="from-date"
                type="date"
                value={tempFilters.from || ''}
                onChange={(e) => setTempFilters(prev => ({ ...prev, from: e.target.value || undefined }))}
                className="pl-10"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <label htmlFor="to-date" className="text-sm font-medium">
              To Date
            </label>
            <div className="relative">
              <Input
                id="to-date"
                type="date"
                value={tempFilters.to || ''}
                onChange={(e) => setTempFilters(prev => ({ ...prev, to: e.target.value || undefined }))}
                className="pl-10"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
          </div>

          {/* Apply Button */}
          <div className="pt-2 border-t">
            <Button onClick={handleApplyFilters} size="sm" className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )

  const renderCategoriesList = () => {
    if (categoriesLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (categoriesError) {
      return (
        <div className="text-sm text-destructive">
          Failed to load categories
          {categoriesErrorDetails instanceof Error && (
            <div className="text-xs text-muted-foreground mt-1">
              {categoriesErrorDetails.message}
            </div>
          )}
        </div>
      )
    }

    if (categories.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <p className="text-sm">No categories found</p>
          <p className="text-xs mt-1">Create your first category to get started</p>
        </div>
      )
    }

    return (
      <div className="max-h-[600px] overflow-y-auto pr-1">
        <CategoryList 
          categories={categories}
          getCategoryUsage={getCategoryUsage}
          onEdit={handleEditCategory}
          statisticsLoading={statisticsLoading}
        />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Categories ({categories.length})
            </CardTitle>
            <div className="flex gap-2">
              {renderFiltersPopover()}
              <Button 
                onClick={() => setShowCreateForm(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="size-4" />
                Add Category
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {renderCategoriesList()}
        </CardContent>
      </Card>

      {/* Create Category Form */}
      {showCreateForm && (
        <CategoryForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit Category Form */}
      {editingCategory && (
        <CategoryForm
          category={editingCategory}
          onSuccess={handleEditSuccess}
          onCancel={handleCloseEdit}
        />
      )}
    </>
  )
}
