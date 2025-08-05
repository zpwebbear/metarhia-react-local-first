/**
 * Get the start and end dates for the current month
 * @returns Object with `from` and `to` dates in YYYY-MM-DD format
 */
export function getCurrentMonthDateRange() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  // First day of current month
  const from = new Date(year, month, 1)
  
  // Last day of current month
  const to = new Date(year, month + 1, 0)

  return {
    from: from.toISOString().split('T')[0], // YYYY-MM-DD format
    to: to.toISOString().split('T')[0]      // YYYY-MM-DD format
  }
}

/**
 * Get formatted month name and year
 * @returns String like "August 2025"
 */
export function getCurrentMonthLabel() {
  const now = new Date()
  return now.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })
}
