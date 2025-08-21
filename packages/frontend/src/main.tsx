import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { ApplicationProvider } from './providers/ApplicationProvider'
import { router } from './router'
import { queryClient } from './lib/query-client'
import { QueryClientProvider } from '@tanstack/react-query'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApplicationProvider>
      <QueryClientProvider client={queryClient}>

        <RouterProvider router={router} />
      </QueryClientProvider>

    </ApplicationProvider>
  </StrictMode>,
)
