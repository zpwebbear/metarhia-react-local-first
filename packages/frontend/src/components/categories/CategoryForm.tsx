import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { createPortal } from 'react-dom'
import { createCategory, updateCategory } from '@/services/categories'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import type { Category } from '@/types'

interface CategoryFormData {
  name: string
}

interface CategoryFormProps {
  category?: Category // If provided, form is in edit mode
  onSuccess: () => void
  onCancel: () => void
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!category

  // Form setup
  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: category?.name || '',
    },
  })

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      form.reset()
      handleClose()
      onSuccess()
    },
    onError: (error) => {
      console.error('Failed to create category:', error)
    },
  })

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormData) => {
      if (!category) throw new Error('No category to update')
      return updateCategory(category.id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      handleClose()
      onSuccess()
    },
    onError: (error) => {
      console.error('Failed to update category:', error)
    },
  })

  const mutation = isEditing ? updateCategoryMutation : createCategoryMutation

  const onSubmit = (data: CategoryFormData) => {
    if (isEditing) {
      updateCategoryMutation.mutate(data)
    } else {
      createCategoryMutation.mutate(data)
    }
  }

  const handleClose = () => {
    form.reset()
    onCancel()
  }

  return createPortal(
    <Dialog open={true} onOpenChange={(open) => !open && handleClose()} id={`category-form-${isEditing ? 'edit' : 'create'}`}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the category name below.'
              : 'Enter a name for the new category below.'
            }
          </DialogDescription>
        </DialogHeader>

        {mutation.isError && (
          <Alert>
            <AlertDescription>
              Failed to {isEditing ? 'update' : 'create'} category: {mutation.error?.message}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: 'Category name is required',
                minLength: { value: 1, message: 'Category name cannot be empty' },
                maxLength: { value: 255, message: 'Category name must be less than 255 characters' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name *</FormLabel>
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

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>,
    document.body
  )
}
