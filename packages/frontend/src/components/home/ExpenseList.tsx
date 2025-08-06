import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Expense } from '@/types'

interface ExpenseListProps {
  expenses: Expense[]
}

export function ExpenseList({
  expenses,
}: ExpenseListProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      'Food & Drink': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Transport': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Entertainment': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Others': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    }
    return colors[category as keyof typeof colors] || colors['Others']
  }

  return (

    <div className="space-y-3">
      {expenses.map((expense, index) => (
        <div key={expense.id}>
          <Card className="p-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{expense.name}</h3>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getCategoryColor(expense.category.name)}`}
                    >
                      {expense.category.name}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(expense.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    ${expense.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {index < expenses.length - 1 && <div className="h-px" />}
        </div>
      ))}
    </div>
  )
}
