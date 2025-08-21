import { Button } from "@/components/ui/button";
import { ApplicationContext } from "@/providers/ApplicationProvider";
import { useContext } from "react";

export function ClearDatabaseButton() {
  const app = useContext(ApplicationContext)

  return <Button onClick={() => app.clearDatabase()}>Clear Database</Button>;
}