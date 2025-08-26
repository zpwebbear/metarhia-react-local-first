import { Button } from "@/components/ui/button";
import { useApplicationStore } from "@/store/use-application-store";

export function PWAInstallButton() {
  const installPrompt = useApplicationStore((state) => state.prompt);
  const install = useApplicationStore((state) => state.install);
  const handleInstallClick = async () => {
    install();
  }

  return (
    <Button onClick={handleInstallClick} disabled={!installPrompt}>
      Install PWA
    </Button>
  );
}