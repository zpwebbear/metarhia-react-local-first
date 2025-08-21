import { Button } from "@/components/ui/button";
import { ApplicationContext } from "@/providers/ApplicationProvider";
import { useContext } from "react";

export function UpdateCacheButton () {
  const app = useContext(ApplicationContext);

  return <Button onClick={() => app.updateCache()}>Update Cache</Button>;
}