import React, { type PropsWithChildren } from "react";
import { app } from '@/application/domain.js';

export const ApplicationContext = React.createContext(app);

export const ApplicationProvider = ({ children }: PropsWithChildren) => {
  return (
    <ApplicationContext value={app}>
      {children}
    </ApplicationContext>
  );
};
