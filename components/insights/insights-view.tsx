'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Target,
  PiggyBank,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Wallet,
  BarChart3,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { useFinanceStore, formatCurrency, getCategoryColor, type TransactionCategory } from '@/lib/store'

interface InsightCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  color: string
  trend?: 'up' | 'down' | 'neutral'
  delay: number
}

function InsightCard({ title, value, subtitle, icon, color, trend, delay }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden"
    >
      <div 
        className="absolute inset-0 opacity-10"
        style={{ 
          background: `linear-gradient(135deg, ${color}40 0%, transparent 60%)` 
        }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 ${
              trend === 'up' ? 'text-income' : trend === 'down' ? 'text-expense' : 'text-muted-foreground'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
               trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </motion.div>
  )
}

export default function InsightsView() {
  const transactions = useFinanceStore((state) => state.transactions)

  const insights = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense')
    const income = transactions.filter((t) => t.type === 'income')
    
    // Category breakdown
    const categoryTotals: Record<string, number> = {}
    expenses.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
    })
    
    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
    
    const highestCategory = sortedCategories[0]
    const lowestCategory = sortedCategories[sortedCategories.length - 1]
    
    // Monthly comparison
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const currentMonthExpenses = expenses
      .filter((t) => {
        const d = new Date(t.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const lastMonthExpenses = expenses
      .filter((t) => {
        const d = new Date(t.date)
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const currentMonthIncome = income
      .filter((t) => {
        const d = new Date(t.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const lastMonthIncome = income
      .filter((t) => {
        const d = new Date(t.date)
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const expenseChange = lastMonthExpenses > 0 
      ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
      : 0

    const incomeChange = lastMonthIncome > 0 
      ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 
      : 0

    // Savings rate
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    // Average transaction
    const avgExpense = expenses.length > 0 
      ? expenses.reduce((sum, t) => sum + t.amount, 0) / expenses.length 
      : 0

    // Monthly data for charts
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

    const chartData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => {
        const [year, monthNum] = month.split('-')
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'short' })
        return {
          month: monthName,
          income: data.income,
          expense: data.expense,
          savings: data.income - data.expense,
        }
      })

    // Category chart data
    const categoryChartData = sortedCategories.slice(0, 6).map(([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount,
      fill: getCategoryColor(category as TransactionCategory),
    }))

    return {
      highestCategory,
      lowestCategory,
      currentMonthExpenses,
      lastMonthExpenses,
      expenseChange,
      incomeChange,
      savingsRate,
      avgExpense,
      chartData,
      categoryChartData,
      totalExpenses,
      totalIncome,
    }
  }, [transactions])

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-foreground font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Financial Insights</h2>
        <p className="text-muted-foreground">Understand your spending patterns and financial health</p>
      </div>

      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard
          title="Highest Spending"
          value={insights.highestCategory ? insights.highestCategory[0].charAt(0).toUpperCase() + insights.highestCategory[0].slice(1) : 'N/A'}
          subtitle={insights.highestCategory ? formatCurrency(insights.highestCategory[1]) : 'No data'}
          icon={<TrendingUp className="w-6 h-6" />}
          color="#f43f5e"
          trend="up"
          delay={0}
        />
        <InsightCard
          title="Savings Rate"
          value={`${insights.savingsRate.toFixed(1)}%`}
          subtitle={insights.savingsRate >= 20 ? 'Great job!' : 'Room to improve'}
          icon={<PiggyBank className="w-6 h-6" />}
          color="#2dd4bf"
          trend={insights.savingsRate >= 20 ? 'up' : 'down'}
          delay={0.1}
        />
        <InsightCard
          title="Expense Change"
          value={`${insights.expenseChange >= 0 ? '+' : ''}${insights.expenseChange.toFixed(1)}%`}
          subtitle="vs last month"
          icon={<BarChart3 className="w-6 h-6" />}
          color={insights.expenseChange <= 0 ? '#22c55e' : '#f43f5e'}
          trend={insights.expenseChange <= 0 ? 'down' : 'up'}
          delay={0.2}
        />
        <InsightCard
          title="Avg Transaction"
          value={formatCurrency(insights.avgExpense)}
          subtitle="per expense"
          icon={<Wallet className="w-6 h-6" />}
          color="#a78bfa"
          delay={0.3}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Monthly Comparison</h3>
            <p className="text-sm text-muted-foreground">Income vs Expenses trend</p>
          </div>

          {insights.chartData.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}

          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#2dd4bf]" />
              <span className="text-sm text-muted-foreground">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#f43f5e]" />
              <span className="text-sm text-muted-foreground">Expenses</span>
            </div>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Top Spending Categories</h3>
            <p className="text-sm text-muted-foreground">Where your money goes</p>
          </div>

          {insights.categoryChartData.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.categoryChartData} layout="vertical" margin={{ top: 10, right: 10, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="glass-card rounded-lg p-3 border border-border/50">
                            <p className="text-foreground font-medium">{data.category}</p>
                            <p className="text-sm" style={{ color: data.fill }}>{formatCurrency(data.amount)}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {insights.categoryChartData.map((entry, index) => (
                      <motion.rect
                        key={index}
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        fill={entry.fill}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No expenses recorded
            </div>
          )}
        </motion.div>
      </div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Financial Tips</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.savingsRate < 20 && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Increase Your Savings</p>
                <p className="text-xs text-muted-foreground">Aim for at least 20% savings rate for financial security</p>
              </div>
            </div>
          )}

          {insights.highestCategory && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
              <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Monitor {insights.highestCategory[0]}</p>
                <p className="text-xs text-muted-foreground">Your highest spending category - consider setting a budget</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
            <PiggyBank className="w-5 h-5 text-income flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Track Regularly</p>
              <p className="text-xs text-muted-foreground">Review your finances weekly to stay on top of spending</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
