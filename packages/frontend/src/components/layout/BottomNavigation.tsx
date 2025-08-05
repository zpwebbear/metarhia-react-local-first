import { useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Home, DollarSign, BarChart3, Tag } from 'lucide-react'
import { useMemo } from 'react'

const navigationItems =  [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/expenses', icon: DollarSign, label: 'Expenses' },
    { path: '/statistics', icon: BarChart3, label: 'Statistics' },
    { path: '/categories', icon: Tag, label: 'Categories' },
]

export function BottomNavigation() {
  const {pathname} = useLocation()
  const navigate = useNavigate()

  const navigationItemsDynamic = useMemo(() => {
    return navigationItems.map(item => ({
      ...item,
      isActive: pathname === item.path
    }))
  }, [pathname])


  const handleNavigate = (path: string) => {
    navigate(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="grid grid-cols-4">
        {navigationItemsDynamic.map(({ path, icon: Icon, label, isActive }) => {
          return (
            <Button
              key={path}
              variant={isActive ? 'default' : 'ghost'}
              className="h-16 flex-col gap-1 rounded-none"
              onClick={() => handleNavigate(path)}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
