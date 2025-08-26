import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { AddExpenseButton } from '@/components/home/AddExpenseButton'
import { createExpense } from '@/services/expenses'
import { fetchCategories, createCategory } from '@/services/categories'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Loader2 } from 'lucide-react'
import { getCurrentMonthDateRange } from '@/utils/date'

interface ExpenseFormData {
  name: string
  amount: number
  categoryId: string
  date: string
  description?: string
}

interface NewCategoryFormData {
  name: string
}

export function AddExpenseWidget() {
  const currentMonthRange = getCurrentMonthDateRange()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false)
  const queryClient = useQueryClient()

  // Form for expense creation
  const expenseForm = useForm<ExpenseFormData>({
    defaultValues: {
      name: '',
      amount: 0,
      categoryId: '',
      date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      description: '',
    },
  })

  // Form for new category creation
  const categoryForm = useForm<NewCategoryFormData>({
    defaultValues: {
      name: '',
    },
  })

  // Fetch categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorDetails,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Mutation for creating expense
  const createExpenseMutation = useMutation({
    mutationFn: (data: ExpenseFormData) =>
      createExpense({
        name: data.name,
        amount: Number(data.amount),
        categoryId: data.categoryId,
        date: data.date,
        description: data.description,
      }),
    onSuccess: () => {
      // Invalidate and refetch expenses data
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expenses', 'current-month', currentMonthRange.from, currentMonthRange.to] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      queryClient.invalidateQueries({ queryKey: ['statistics', 'current-month', currentMonthRange.from, currentMonthRange.to] })

      // Reset form and close dialog
      expenseForm.reset()
      setIsDialogOpen(false)
    },
    onError: (error) => {
      console.error('Failed to create expense:', error)
    },
  })

  // Mutation for creating new category
  const createCategoryMutation = useMutation({
    mutationFn: (data: NewCategoryFormData) =>
      createCategory({
        name: data.name,
      }),
    onSuccess: (newCategory) => {
      // Invalidate categories to refetch with new category
      queryClient.invalidateQueries({ queryKey: ['categories'] })

      // Set the newly created category as selected
      expenseForm.setValue('categoryId', newCategory.id)

      // Reset category form and hide the new category form
      categoryForm.reset()
      setIsCreatingNewCategory(false)
    },
    onError: (error) => {
      console.error('Failed to create category:', error)
    },
  })

  const onSubmitExpense = (data: ExpenseFormData) => {
    createExpenseMutation.mutate(data)
  }

  const onSubmitNewCategory = (data: NewCategoryFormData) => {
    createCategoryMutation.mutate(data)
  }

  const handleAddExpense = () => {
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    expenseForm.reset()
    categoryForm.reset()
    setIsCreatingNewCategory(false)
  }

  return (
    <>
      <AddExpenseButton onAdd={handleAddExpense} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} id="add-expense-dialog">
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new expense to your records.
            </DialogDescription>
          </DialogHeader>

          {categoriesError && (
            <Alert>
              <AlertDescription>
                Failed to load categories: {categoriesErrorDetails?.message}
              </AlertDescription>
            </Alert>
          )}

          <Form {...expenseForm}>
            <form onSubmit={expenseForm.handleSubmit(onSubmitExpense)} className="space-y-4">
              <FormField
                control={expenseForm.control}
                name="name"
                rules={{ required: 'Expense name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter expense name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={expenseForm.control}
                name="amount"
                rules={{
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={expenseForm.control}
                name="date"
                rules={{ required: 'Date is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={expenseForm.control}
                name="categoryId"
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => {
                            if (value === 'new') {
                              setIsCreatingNewCategory(true)
                            } else {
                              field.onChange(value)
                            }
                          }}
                          disabled={categoriesLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="new">
                              <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create new category
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>

                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={expenseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter expense description (optional)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description for additional details about the expense.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {createExpenseMutation.isError && (
                <Alert>
                  <AlertDescription>
                    Failed to create expense: {createExpenseMutation.error?.message}
                  </AlertDescription>
                </Alert>
              )}

              {createCategoryMutation.isError && (
                <Alert>
                  <AlertDescription>
                    Failed to create category: {createCategoryMutation.error?.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={createExpenseMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createExpenseMutation.isPending || categoriesLoading}
                >
                  {createExpenseMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Add Expense
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
        {isCreatingNewCategory && createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsCreatingNewCategory(false)
              }
            }}
          >
            <Card
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Create New Category</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Form {...categoryForm}>
                  <form
                    onSubmit={categoryForm.handleSubmit(onSubmitNewCategory)}
                    className="space-y-3"
                  >
                    <FormField
                      control={categoryForm.control}
                      name="name"
                      rules={{
                        required: 'Category name is required',
                        maxLength: { value: 255, message: 'Category name must be less than 255 characters' },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter category name"
                              {...field}
                              autoFocus
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={createCategoryMutation.isPending}
                      >
                        {createCategoryMutation.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Create
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreatingNewCategory(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>,
          document.getElementById('radix-«r0»') || document.body
        )}
      </Dialog>
    </>
  )
}
