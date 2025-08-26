import { ClearDatabaseButton } from "@/widgets/common/ClearDatabaseButton"
import { NetworkStatusIndicator } from "@/widgets/common/NetworkStatusIndicator"
import { PWAInstallButton } from "@/widgets/common/PWAInstallButton"
import { UpdateCacheButton } from "@/widgets/common/UpdateCacheButton"

interface HeaderProps {
  title?: string
}

export function Header({ title = 'Expense Tracker' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center gap-4 px-4">
      <div className="container flex h-14 items-center">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <UpdateCacheButton/>
      <ClearDatabaseButton/>
      <PWAInstallButton />
      <NetworkStatusIndicator />
    </header>
  )
}
