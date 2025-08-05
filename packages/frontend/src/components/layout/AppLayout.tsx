import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Home, DollarSign, BarChart3, Tag } from 'lucide-react'

interface AppLayoutProps {
  children: ReactNode
  title?: string
}

export function AppLayout({ children, title = 'Expense Tracker' }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="grid grid-cols-4">
          <Button variant="ghost" className="h-16 flex-col gap-1 rounded-none">
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="h-16 flex-col gap-1 rounded-none">
            <DollarSign className="w-5 h-5" />
            <span className="text-xs">Expenses</span>
          </Button>
          <Button variant="ghost" className="h-16 flex-col gap-1 rounded-none">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Statistics</span>
          </Button>
          <Button variant="ghost" className="h-16 flex-col gap-1 rounded-none">
            <Tag className="w-5 h-5" />
            <span className="text-xs">Categories</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}
