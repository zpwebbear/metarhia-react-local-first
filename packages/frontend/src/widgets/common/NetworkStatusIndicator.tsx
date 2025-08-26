import { useApplicationStore } from "@/store/use-application-store";
import { CloudCheck, CloudAlert } from "lucide-react"

export function NetworkStatusIndicator() {
  const isOnline = useApplicationStore((state) => state.online);

  return (
    <div className="flex items-center space-x-2">
      {isOnline ? (
        <>
        <CloudCheck className="text-green-500" />
        <span className="text-green-500">Online</span>
        </>
      ) : (
        <>
        <CloudAlert className="text-red-500" />
        <span className="text-red-500">Offline</span>
        </>
      )}
    </div>
  )
}