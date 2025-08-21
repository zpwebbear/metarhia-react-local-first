import { Button } from "@/components/ui/button";
import { ApplicationContext } from "@/providers/ApplicationProvider";
import { useApplicationStore } from "@/store/use-application-store";
import { useContext } from "react";

export function PWAInstallButton() {
  const app = useContext(ApplicationContext)

  const installPrompt = useApplicationStore((state) => state.prompt);
  const handleInstallClick = async () => {
    app.install();
  }

  return (
    <Button onClick={handleInstallClick} disabled={!installPrompt}>
      Install PWA
    </Button>
  );
}