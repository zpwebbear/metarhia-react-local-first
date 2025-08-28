import type { app, ExpenseTrackerApplication } from '@/application/domain';
import { ApplicationContext } from '@/providers/ApplicationProvider';
import { useContext, useSyncExternalStore } from 'react';

const UI_UPDATE_EVENTS = ['status', 'network', 'install', 'installed', 'state', 'delta'];

type ApplicationValues = ExpenseTrackerApplication[keyof ExpenseTrackerApplication];
type Selector<T extends ApplicationValues> = (appInstance: typeof app) => T;

export function useApplicationState<T extends ApplicationValues>(selector: Selector<T>) {
  const app = useContext(ApplicationContext);

  if (!app) {
    throw new Error('useApplicationState must be used within an ApplicationProvider');
  }

  const state = useSyncExternalStore(
    (onStoreChange) => {
      const unsubscribers = UI_UPDATE_EVENTS.map(eventName =>
        app.on(eventName, onStoreChange)
      );

      return () => unsubscribers.forEach(unsubscribe => unsubscribe());
    },
    () => selector(app) 
  );

  return state;
}