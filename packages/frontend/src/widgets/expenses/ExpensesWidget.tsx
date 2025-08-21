import { ExpenseList } from '@/components/home/ExpenseList'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApplicationStore } from '@/store/use-application-store'
import type { ExpenseFilters } from '@/types'
import { CalendarIcon, FilterIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

export function ExpensesWidget() {
  const filters = useApplicationStore(state => state.filters);
  const setFilters = useApplicationStore(state => state.setFilters);
  const resetFilters = useApplicationStore(state => state.resetFilters);
  const filterExpenses = useApplicationStore(state => state.filterExpenses);
  const categories = useApplicationStore(state => state.categories);
  const expenses = useApplicationStore(state => state.expenses);

  const [tempFilters, setTempFilters] = useState<Pick<ExpenseFilters, 'from' | 'to' | 'categoryId'>>({})
  const [filtersOpen, setFiltersOpen] = useState(false)


  const filteredExpenses = useMemo(() => {
    // Call the function obtained from the store
    return filterExpenses(filters);
  }, [filters, filterExpenses, expenses]);

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

  const hasActiveFilters = Object.values(filters).some(value => value !== null && value !== '')
  const hasActiveFiltersCount = Object.values(filters).filter(v => v !== null && v !== '').length

  const renderFiltersPopover = () => (
    <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <FilterIcon className="size-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full size-5 flex items-center justify-center">
              {hasActiveFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filter Expenses</h4>
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

          {/* Category Filter */}
          <div className="space-y-2">
            <label htmlFor="category-filter" className="text-sm font-medium">
              Category
            </label>
            <Select
              value={tempFilters.categoryId?.toString() || 'all'}
              onValueChange={(value) => 
                setTempFilters(prev => ({ 
                  ...prev, 
                  categoryId: value === 'all' ? undefined : value
                }))
              }
            >
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
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

  const renderExpensesList = () => {

    if (filteredExpenses.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <p className="text-sm">No expenses found</p>
          {hasActiveFilters && (
            <p className="text-xs mt-1">Try adjusting your filters</p>
          )}
        </div>
      )
    }

    return (
      <div className="max-h-[600px] overflow-y-auto pr-1">
        <ExpenseList expenses={filteredExpenses} />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Expenses ({expenses.length})
          </CardTitle>
          {renderFiltersPopover()}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {renderExpensesList()}
      </CardContent>
    </Card>
  )
}
