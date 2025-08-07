import { AppLayout } from '@/components/layout/AppLayout'
import { CategoriesWidget } from '@/widgets/categories/CategoriesWidget'

export function CategoriesPage() {
  return (
    <AppLayout title="Categories">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <CategoriesWidget />
      </div>
    </AppLayout>
  )
}
