import { AppLayout } from '@/components/layout/AppLayout'

export function CategoriesPage() {
  return (
    <AppLayout title="Categories">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        {/* TODO: Add category management components */}
        <p className="text-muted-foreground">
          This page will allow users to add, edit, and delete expense categories.
        </p>
      </div>
    </AppLayout>
  )
}
