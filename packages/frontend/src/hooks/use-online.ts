import { useApplicationStore } from "@/store/use-application-store"

export function useOnline() {
  const isOnline = useApplicationStore((state) => state.online)

  return isOnline
}