import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface AddExpenseButtonProps {
  onAdd: () => void
}

export function AddExpenseButton({ onAdd }: AddExpenseButtonProps) {
  return (
    <Button className="w-full" size="lg" onClick={onAdd}>
      <Plus className="w-4 h-4 mr-2" />
      Add New Expense
    </Button>
  )
}
