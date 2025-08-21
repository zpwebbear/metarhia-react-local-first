import { Button } from '@/components/ui/button'
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
import { useApplicationStore } from '@/store/use-application-store'
import type { Category } from '@/types'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'

interface CategoryFormData {
  name: string
}

interface CategoryFormProps {
  category?: Category // If provided, form is in edit mode
  onSuccess: () => void
  onCancel: () => void
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const isEditing = !!category

  // Form setup
  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: category?.name || '',
    },
  })

  const editCategory = useApplicationStore(state => state.editCategory);
  const createCategory = useApplicationStore(state => state.createCategory);

  const onSubmit = (data: CategoryFormData) => {
    if (isEditing) {
      editCategory(category.id, data)
    } else {
      createCategory(data)
    }

    onSuccess()
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
              >
                Cancel
              </Button>
              <Button
                type="submit"
              >
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
