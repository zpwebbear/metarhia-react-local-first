import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Category } from '@/types'
import { Edit } from 'lucide-react'

interface CategoryListProps {
  categories: Category[]
  getCategoryUsage: (categoryId: string) => number
  onEdit: (category: Category) => void
}

export function CategoryList({
  categories,
  getCategoryUsage,
  onEdit,
}: CategoryListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
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
    <div className="space-y-3">
      {categories.map((category) => {
        const usage = getCategoryUsage(category.id)

        return (
          <Card key={category.id} className="p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-sm">{category.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {formatCurrency(usage)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created: {formatDate(category.created_at)}</span>
                    <span>Updated: {formatDate(category.updated_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(category)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit category</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
