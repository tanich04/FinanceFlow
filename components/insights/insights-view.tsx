'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Target,
  PiggyBank,
  AlertTriangle,
  Sparkles,
  Wallet,
  BarChart3,
  Info,
  ChevronRight,
  Lightbulb,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useFinanceStore, formatCurrency, getCategoryColor, type TransactionCategory } from '@/lib/store'

interface InsightCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  color: string
  trend?: 'up' | 'down' | 'neutral'
  delay: number
  description: string
}

function InsightCard({ title, value, subtitle, icon, color, trend, delay, description }: InsightCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <TooltipProvider delayDuration={300}>
      <UITooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div 
              className="absolute inset-0 opacity-0"
              animate={{ opacity: isHovered ? 0.15 : 0 }}
              style={{ 
                background: `linear-gradient(135deg, ${color}60 0%, transparent 60%)` 
              }}
            />
            
            <motion.div 
              className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl"
              animate={{ 
                opacity: isHovered ? 0.4 : 0.2,
                scale: isHovered ? 1.3 : 1 
              }}
              style={{ backgroundColor: color }}
            />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  className="p-3 rounded-xl transition-all duration-300"
                  style={{ backgroundColor: `${color}20` }}
                  animate={{ scale: isHovered ? 1.1 : 1, rotate: isHovered ? 5 : 0 }}
                >
                  <div style={{ color }}>{icon}</div>
                </motion.div>
                {trend && (
                  <motion.div 
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                      trend === 'up' ? 'bg-income/20 text-income' : 
                      trend === 'down' ? 'bg-expense/20 text-expense' : 
                      'bg-muted text-muted-foreground'
                    }`}
                    animate={{ scale: isHovered ? 1.1 : 1 }}
                  >
                    {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                     trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                  </motion.div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                {title}
                <Info className="w-3 h-3 opacity-50" />
              </p>
              <motion.p 
                className="text-2xl font-bold text-foreground mb-1"
                animate={{ scale: isHovered ? 1.02 : 1 }}
              >
                {value}
              </motion.p>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="glass-card max-w-xs">
          <p className="text-sm">{description}</p>
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
  )
}

export default function InsightsView() {
  const transactions = useFinanceStore((state) => state.transactions)
  const theme = useFinanceStore((state) => state.theme)
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null)

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
      rawCategory: category,
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
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-4 border border-border/50 shadow-xl"
        >
          <p className="text-foreground font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
              <span className="font-medium" style={{ color: entry.color }}>{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </motion.div>
      )
    }
    return null
  }

  const tips = [
    {
      show: insights.savingsRate < 20,
      icon: AlertTriangle,
      color: 'text-amber-500',
      title: 'Increase Your Savings',
      description: `Your savings rate is ${insights.savingsRate.toFixed(1)}%. Aim for at least 20% for financial security.`,
    },
    {
      show: !!insights.highestCategory,
      icon: Target,
      color: 'text-primary',
      title: `Monitor ${insights.highestCategory?.[0] || 'Spending'}`,
      description: `Your highest spending category at ${insights.highestCategory ? formatCurrency(insights.highestCategory[1]) : 'N/A'}. Consider setting a budget.`,
    },
    {
      show: insights.expenseChange > 10,
      icon: TrendingUp,
      color: 'text-expense',
      title: 'Spending Increase Alert',
      description: `Your expenses increased by ${insights.expenseChange.toFixed(1)}% this month. Review your recent purchases.`,
    },
    {
      show: true,
      icon: PiggyBank,
      color: 'text-income',
      title: 'Track Regularly',
      description: 'Review your finances weekly to stay on top of spending patterns.',
    },
    {
      show: insights.savingsRate >= 20,
      icon: Sparkles,
      color: 'text-primary',
      title: 'Great Savings Rate!',
      description: `You are saving ${insights.savingsRate.toFixed(1)}% of your income. Keep up the excellent work!`,
    },
  ].filter(tip => tip.show)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financial Insights</h2>
          <p className="text-muted-foreground">Understand your spending patterns and financial health</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary"
        >
          <Lightbulb className="w-4 h-4" />
          <span className="text-sm font-medium">{tips.length} tips for you</span>
        </motion.div>
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
          description="The category where you spend the most money. Consider setting a budget for this area."
        />
        <InsightCard
          title="Savings Rate"
          value={`${insights.savingsRate.toFixed(1)}%`}
          subtitle={insights.savingsRate >= 20 ? 'Great job!' : 'Room to improve'}
          icon={<PiggyBank className="w-6 h-6" />}
          color="#2dd4bf"
          trend={insights.savingsRate >= 20 ? 'up' : 'down'}
          delay={0.1}
          description="Percentage of income saved after expenses. Financial experts recommend saving at least 20%."
        />
        <InsightCard
          title="Expense Change"
          value={`${insights.expenseChange >= 0 ? '+' : ''}${insights.expenseChange.toFixed(1)}%`}
          subtitle="vs last month"
          icon={<BarChart3 className="w-6 h-6" />}
          color={insights.expenseChange <= 0 ? '#22c55e' : '#f43f5e'}
          trend={insights.expenseChange <= 0 ? 'down' : 'up'}
          delay={0.2}
          description="How your spending compares to last month. A decrease indicates better budget control."
        />
        <InsightCard
          title="Avg Transaction"
          value={formatCurrency(insights.avgExpense)}
          subtitle="per expense"
          icon={<Wallet className="w-6 h-6" />}
          color="#a78bfa"
          delay={0.3}
          description="The average amount spent per transaction. Useful for identifying spending patterns."
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card glass-card-hover rounded-2xl p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Monthly Comparison</h3>
            <p className="text-sm text-muted-foreground">Income vs Expenses trend</p>
          </div>

          {insights.chartData.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={insights.chartData} 
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  onMouseMove={(e) => {
                    if (e.activeTooltipIndex !== undefined) {
                      setActiveBarIndex(e.activeTooltipIndex)
                    }
                  }}
                  onMouseLeave={() => setActiveBarIndex(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis dataKey="month" stroke={colors.text} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={colors.text} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="income" fill={colors.income} radius={[4, 4, 0, 0]}>
                    {insights.chartData.map((_, index) => (
                      <Cell 
                        key={`income-${index}`}
                        fill={colors.income}
                        opacity={activeBarIndex === null || activeBarIndex === index ? 1 : 0.5}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="expense" fill={colors.expense} radius={[4, 4, 0, 0]}>
                    {insights.chartData.map((_, index) => (
                      <Cell 
                        key={`expense-${index}`}
                        fill={colors.expense}
                        opacity={activeBarIndex === null || activeBarIndex === index ? 1 : 0.5}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}

          <div className="flex items-center justify-center gap-6 mt-4">
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
              <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.income }} />
              <span className="text-sm text-muted-foreground">Income</span>
            </motion.div>
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
              <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.expense }} />
              <span className="text-sm text-muted-foreground">Expenses</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card glass-card-hover rounded-2xl p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Top Spending Categories</h3>
            <p className="text-sm text-muted-foreground">Where your money goes</p>
          </div>

          {insights.categoryChartData.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={insights.categoryChartData} 
                  layout="vertical" 
                  margin={{ top: 10, right: 10, left: 70, bottom: 0 }}
                  onMouseMove={(e) => {
                    if (e.activeTooltipIndex !== undefined) {
                      setActiveCategoryIndex(e.activeTooltipIndex)
                    }
                  }}
                  onMouseLeave={() => setActiveCategoryIndex(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
                  <XAxis type="number" stroke={colors.text} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="category" stroke={colors.text} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass-card rounded-xl p-4 border border-border/50 shadow-xl"
                          >
                            <p className="text-foreground font-semibold">{data.category}</p>
                            <p className="text-sm font-medium" style={{ color: data.fill }}>{formatCurrency(data.amount)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {((data.amount / insights.totalExpenses) * 100).toFixed(1)}% of total
                            </p>
                          </motion.div>
                        )
                      }
                      return null
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {insights.categoryChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.fill}
                        opacity={activeCategoryIndex === null || activeCategoryIndex === index ? 1 : 0.5}
                        style={{ transition: 'opacity 0.2s ease' }}
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
        className="glass-card glass-card-hover rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Financial Tips</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {tips.slice(0, 3).map((tip, index) => {
              const Icon = tip.icon
              return (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/30 cursor-pointer group transition-all hover:border-primary/30"
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
                  >
                    <Icon className={`w-5 h-5 ${tip.color} flex-shrink-0 mt-0.5`} />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {tip.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
