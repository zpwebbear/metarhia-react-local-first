import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { router } from './router'
import { queryClient } from './lib/query-client'
import { app } from './application/domain'

app.on('delta', () => {
  queryClient.invalidateQueries()
});
app.on('state', () => {
  queryClient.invalidateQueries()
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
