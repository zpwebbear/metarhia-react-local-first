import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Edit, Trash2 } from 'lucide-react'
import type { Category } from '@/types'

interface CategoryListProps {
  categories: Category[]
  getCategoryUsage: (categoryId: number) => number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  statisticsLoading: boolean
}

export function CategoryList({
  categories,
  getCategoryUsage,
  onEdit,
  onDelete,
  statisticsLoading,
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
                      {statisticsLoading ? (
                        <Skeleton className="h-5 w-16" />
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {formatCurrency(usage)}
                        </Badge>
                      )}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(category)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete category</span>
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
