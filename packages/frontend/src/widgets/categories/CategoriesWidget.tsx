import { CategoryForm } from '@/components/categories/CategoryForm'
import { CategoryList } from '@/components/categories/CategoryList'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useApplicationStore } from '@/store/use-application-store'
import type { Category } from '@/types'
import { CalendarIcon, FilterIcon, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

export function CategoriesWidget() {
  const filters = useApplicationStore(state => state.categoryFilters)
  const setFilters = useApplicationStore(state => state.setCategoryFilters)
  const resetFilters = useApplicationStore(state => state.resetCategoryFilters)
  const filterCategories = useApplicationStore(state => state.filterCategories)
  const allCategories = useApplicationStore(state => state.categories)
  const getStatistics = useApplicationStore(state => state.getStatistics)
  const [tempFilters, setTempFilters] = useState<{ from?: string; to?: string }>({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const categories = useMemo(() => {
    return filterCategories(filters)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, filterCategories, allCategories])

  const statistics = useMemo(() => {
    return getStatistics(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, getStatistics, allCategories]);

  const handleApplyFilters = () => {
    setFilters(tempFilters)
    setFiltersOpen(false)
  }

  const handleClearFilters = () => {
    const emptyFilters = {}
    setTempFilters(emptyFilters)
    resetFilters()
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

  const hasActiveFilters = Object.values(filters).some(value => value !== null && value !== '')
  const hasActiveFiltersCount = Object.values(filters).filter(v => v !== null && v !== '').length

  // Get category usage from statistics
  const getCategoryUsage = (categoryId: string) => {
    if (!statistics) return 0
    const categoryStats = statistics.categories.find(c => c.categoryId === categoryId)
    return categoryStats?.amount || 0
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
          <div className="max-h-[600px] overflow-y-auto pr-1">
            <CategoryList
              categories={categories}
              getCategoryUsage={getCategoryUsage}
              onEdit={handleEditCategory}
            />
          </div>
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
