import { createBrowserRouter } from 'react-router'
import { HomePage } from './pages/HomePage'
import { ExpensesPage } from './pages/ExpensesPage'
import { StatisticsPage } from './pages/StatisticsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { ExpensesLogPage } from './pages/ExpensesLogPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/expenses',
    element: <ExpensesPage />,
  },
  {
    path: '/statistics',
    element: <StatisticsPage />,
  },
  {
    path: '/categories',
    element: <CategoriesPage />,
  },
  {
    path: '/log',
    element: <ExpensesLogPage />,
  }
])
