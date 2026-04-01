'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useFinanceStore, formatCurrency } from '@/lib/store'

export default function BalanceChart() {
  const transactions = useFinanceStore((state) => state.transactions)
  const theme = useFinanceStore((state) => state.theme)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const chartData = useMemo(() => {
    // Group transactions by month
    const monthlyData: Record<string, { income: number; expense: number }> = {}
    
    transactions.forEach((t) => {
      const date = new Date(t.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[key]) {
        monthlyData[key] = { income: 0, expense: 0 }
      }
      
      if (t.type === 'income') {
        monthlyData[key].income += t.amount
      } else {
        monthlyData[key].expense += t.amount
      }
    })

    // Convert to array and sort by date
    const sortedData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]) => {
        const [year, monthNum] = month.split('-')
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'short' })
        return {
          month: monthName,
          income: data.income,
          expense: data.expense,
          balance: data.income - data.expense,
        }
      })

    // Calculate running balance
    let runningBalance = 0
    return sortedData.map((item) => {
      runningBalance += item.balance
      return { ...item, totalBalance: runningBalance }
    })
  }, [transactions])

  const trend = useMemo(() => {
    if (chartData.length < 2) return 0
    const first = chartData[0].balance
    const last = chartData[chartData.length - 1].balance
    if (first === 0) return last > 0 ? 100 : -100
    return ((last - first) / Math.abs(first)) * 100
  }, [chartData])

  const colors = {
    income: theme === 'dark' ? '#2dd4bf' : '#0d9488',
    expense: theme === 'dark' ? '#f43f5e' : '#e11d48',
    grid: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    text: theme === 'dark' ? '#64748b' : '#475569',
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-4 border border-border/50 shadow-xl"
        >
          <p className="text-foreground font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
              <span className="font-medium" style={{ color: entry.color }}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </motion.div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-card glass-card-hover rounded-2xl p-6 h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Balance Trend</h3>
          <p className="text-sm text-muted-foreground">Income vs Expenses over time</p>
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                trend > 0 
                  ? 'bg-income/20 text-income' 
                  : trend < 0 
                    ? 'bg-expense/20 text-expense'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {chartData.length > 0 ? (
        <motion.div 
          className="h-[300px]"
          animate={{ opacity: isHovered ? 1 : 0.9 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              onMouseMove={(e) => {
                if (e.activeTooltipIndex !== undefined) {
                  setActiveIndex(e.activeTooltipIndex)
                }
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.income} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={colors.income} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.expense} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={colors.expense} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="month" 
                stroke={colors.text} 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke={colors.text} 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.income, strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Area
                type="monotone"
                dataKey="income"
                stroke={colors.income}
                strokeWidth={2}
                fill="url(#incomeGradient)"
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2, stroke: colors.income, fill: 'var(--card)' }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke={colors.expense}
                strokeWidth={2}
                fill="url(#expenseGradient)"
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2, stroke: colors.expense, fill: 'var(--card)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      )}

      <div className="flex items-center justify-center gap-6 mt-4">
        <motion.div 
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.income }} />
          <span className="text-sm text-muted-foreground">Income</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.expense }} />
          <span className="text-sm text-muted-foreground">Expenses</span>
        </motion.div>
      </div>
    </motion.div>
  )
}
