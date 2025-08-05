import type { ReactNode } from 'react'
import { Header } from './Header'
import { BottomNavigation } from './BottomNavigation'

interface AppLayoutProps {
  children: ReactNode
  title?: string
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header title={title} />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      <BottomNavigation />
    </div>
  )
}
