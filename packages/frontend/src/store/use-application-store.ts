import { app } from '@/application/domain';
import type { ApplicationStore } from '@/types';
import { create } from 'zustand';

const getApplicationState = () => ({
  isConnected: app.connected,
  online: app.online,
  prompt: app.prompt,
});

const useApplicationStore = create<ApplicationStore>(() => ({
  ...getApplicationState(),
  clearDatabase: () => app.clearDatabase(),
  updateCache: () => app.updateCache(),
  install: () => app.install(),
}));

const syncStateWithStore = () => {
  useApplicationStore.setState(getApplicationState());
};

app.on('stateSet', syncStateWithStore);
app.on('deltaSet', syncStateWithStore);
app.on('stateCleared', syncStateWithStore);
app.on('databaseCleared', syncStateWithStore);
app.on('status', syncStateWithStore);
app.on('network', syncStateWithStore);
app.on('connect', syncStateWithStore);
app.on('delta', syncStateWithStore);
app.on('install', syncStateWithStore);

export { useApplicationStore };
