import { AddExpenseButton } from '@/components/home/AddExpenseButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useApplicationStore } from '@/store/use-application-store'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'

interface ExpenseFormData {
  name: string
  amount: number
  categoryId: number | string
  date: string
  description?: string
}

interface NewCategoryFormData {
  name: string
}

export function AddExpenseWidget() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false)

  const expenseForm = useForm<ExpenseFormData>({
    defaultValues: {
      name: '',
      amount: 0,
      categoryId: '',
      date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      description: '',
    },
  })

  const categoryForm = useForm<NewCategoryFormData>({
    defaultValues: {
      name: '',
    },
  })

  const categories = useApplicationStore((state) => state.categories);
  const createCategory = useApplicationStore((state) => state.createCategory);
  const createExpense = useApplicationStore((state) => state.createExpense);
  const onSubmitExpense = (data: ExpenseFormData) => {
    createExpense(data)
    handleCloseDialog()
  }

  const onSubmitNewCategory = async (data: NewCategoryFormData) => {
    const newCategory: { id: string } = await createCategory(data)
    expenseForm.setValue('categoryId', newCategory.id)
    categoryForm.reset()
    setIsCreatingNewCategory(false)
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
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
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

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                >
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
                      >
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
