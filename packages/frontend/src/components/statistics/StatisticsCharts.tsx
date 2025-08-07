import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import type { StatisticsResponse } from '@/services/statistics'

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    payload: {
      name: string
      value: number
      percentage?: string
    }
  }>
  label?: string
}

interface PieTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: {
      name: string
      value: number
      percentage: string
    }
  }>
}

interface LabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percentage: number
}

interface LegendEntry {
  color?: string
}

interface StatisticsChartsProps {
  statistics: StatisticsResponse
}

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export function StatisticsCharts({ statistics }: StatisticsChartsProps) {
  const { total, categories } = statistics

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  // Prepare data for pie chart
  const pieData = categories.map((category, index) => ({
    name: category.categoryName,
    value: category.amount,
    color: COLORS[index % COLORS.length],
    percentage: ((category.amount / total) * 100).toFixed(1)
  }))

  // Prepare data for bar chart
  const barData = categories
    .sort((a, b) => b.amount - a.amount) // Sort by amount descending
    .map((category, index) => ({
      name: category.categoryName,
      amount: category.amount,
      fill: COLORS[index % COLORS.length]
    }))

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {`Amount: ${formatCurrency(data.value)}`}
          </p>
          {data.payload.percentage && (
            <p className="text-sm text-muted-foreground">
              {`Percentage: ${data.payload.percentage}%`}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }: PieTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {`Amount: ${formatCurrency(data.value)}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {`Percentage: ${data.percentage}%`}
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: LabelProps) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    )
  }

  return (
    <div className="space-y-6">
      {/* Total Amount Display */}
      <div className="text-center">
        <div className="text-3xl font-bold text-foreground">
          {formatCurrency(total)}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Total Expenses ({categories.length} {categories.length === 1 ? 'category' : 'categories'})
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Category Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: LegendEntry) => (
                    <span style={{ color: entry.color || '#000' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Category Amounts</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Category Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories
            .sort((a, b) => b.amount - a.amount)
            .map((category, index) => {
              const percentage = ((category.amount / total) * 100).toFixed(1)
              const color = COLORS[index % COLORS.length]
              
              return (
                <div key={category.categoryId} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{category.categoryName}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(category.amount)} ({percentage}%)
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
