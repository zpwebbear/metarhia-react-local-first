import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { MonthlySummary } from '@/components/home/MonthlySummary'
import { AddExpenseButton } from '@/components/home/AddExpenseButton'
import { ExpenseList } from '@/components/home/ExpenseList'

// Mock data for demonstration
const mockExpenses = [
  { id: 1, name: 'Coffee', amount: 4.50, category: 'Food & Drink', date: '2025-08-05' },
  { id: 2, name: 'Uber ride', amount: 12.30, category: 'Transport', date: '2025-08-04' },
  { id: 3, name: 'Grocery shopping', amount: 45.60, category: 'Food & Drink', date: '2025-08-03' },
  { id: 4, name: 'Netflix subscription', amount: 15.99, category: 'Entertainment', date: '2025-08-02' },
  { id: 5, name: 'Gas station', amount: 35.20, category: 'Transport', date: '2025-08-01' },
]

const currentMonthTotal = 358.42
const currentMonth = 'August 2025'

export function HomePage() {
  const [expenses] = useState(mockExpenses)

  const handleAddExpense = () => {
    console.log('Navigate to add expense')
    // TODO: Navigate to add expense page
  }

  const handleViewAllExpenses = () => {
    console.log('Navigate to expenses page')
    // TODO: Navigate to expenses page
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Monthly Summary */}
        <MonthlySummary month={currentMonth} total={currentMonthTotal} />

        {/* Add Expense Button */}
        <AddExpenseButton onAdd={handleAddExpense} />

        {/* Recent Expenses */}
        <ExpenseList expenses={expenses} onViewAll={handleViewAllExpenses} />

      </div>
    </AppLayout>
  )
}
