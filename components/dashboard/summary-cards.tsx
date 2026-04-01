'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, TrendingUp, TrendingDown, DollarSign, Info, ArrowRight } from 'lucide-react'
import { useFinanceStore, formatCurrency } from '@/lib/store'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SummaryCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  color: string
  delay: number
  description: string
  breakdown?: { label: string; value: string }[]
}

function SummaryCard({ title, value, change, icon, color, delay, description, breakdown }: SummaryCardProps) {
  const isPositive = change >= 0
  const [isHovered, setIsHovered] = useState(false)

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ 
              scale: 1.03, 
              rotateY: 3,
              transition: { duration: 0.3, ease: 'easeOut' }
            }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden cursor-pointer group"
            style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          >
            {/* Animated gradient overlay */}
            <motion.div 
              className="absolute inset-0 opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-500"
              style={{ 
                background: `linear-gradient(135deg, ${color}60 0%, transparent 60%)` 
              }}
            />
            
            {/* Pulsing glow effect */}
            <motion.div 
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl"
              animate={{
                opacity: isHovered ? 0.5 : 0.2,
                scale: isHovered ? 1.2 : 1,
              }}
              transition={{ duration: 0.4 }}
              style={{ backgroundColor: color }}
            />

            {/* Shimmer effect on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
              )}
            </AnimatePresence>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className="p-3 rounded-xl transition-all duration-300"
                  style={{ backgroundColor: `${color}20` }}
                  animate={{ scale: isHovered ? 1.1 : 1 }}
                >
                  <div style={{ color }}>{icon}</div>
                </motion.div>
                <motion.div 
                  className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
                    isPositive ? 'bg-income/20 text-income' : 'bg-expense/20 text-expense'
                  }`}
                  animate={{ scale: isHovered ? 1.05 : 1 }}
                >
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
                </motion.div>
              </div>

              <p className="text-muted-foreground text-sm mb-1 flex items-center gap-1">
                {title}
                <Info className="w-3 h-3 opacity-50" />
              </p>
              <motion.p 
                className="text-2xl lg:text-3xl font-bold text-foreground"
                animate={{ scale: isHovered ? 1.02 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {value}
              </motion.p>

              {/* Hover indicator */}
              <motion.div
                className="flex items-center gap-1 mt-3 text-xs text-muted-foreground"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5 }}
                transition={{ duration: 0.2 }}
              >
                <span>View details</span>
                <ArrowRight className="w-3 h-3" />
              </motion.div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="glass-card max-w-xs p-4"
          sideOffset={8}
        >
          <div className="space-y-2">
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            {breakdown && (
              <div className="pt-2 border-t border-border/50 space-y-1">
                {breakdown.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function SummaryCards() {
  const transactions = useFinanceStore((state) => state.transactions)

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const currentMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const lastMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const year = currentMonth === 0 ? currentYear - 1 : currentYear
      return date.getMonth() === lastMonth && date.getFullYear() === year
    })

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const currentIncome = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const lastIncome = lastMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const currentExpenses = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const lastExpenses = lastMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpenses
    const lastBalance = lastIncome - lastExpenses
    const currentBalance = currentIncome - currentExpenses

    const incomeChange = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0
    const expenseChange = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0
    const balanceChange = lastBalance !== 0 ? ((currentBalance - lastBalance) / Math.abs(lastBalance)) * 100 : 0

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    return {
      balance,
      totalIncome,
      totalExpenses,
      incomeChange,
      expenseChange,
      balanceChange,
      currentIncome,
      currentExpenses,
      savingsRate,
      transactionCount: transactions.length,
    }
  }, [transactions])

  const cards = [
    {
      title: 'Total Balance',
      value: formatCurrency(stats.balance),
      change: stats.balanceChange,
      icon: <Wallet className="w-6 h-6" />,
      color: '#2dd4bf',
      description: 'Your overall financial position combining all income and expenses.',
      breakdown: [
        { label: 'Total Income', value: formatCurrency(stats.totalIncome) },
        { label: 'Total Expenses', value: formatCurrency(stats.totalExpenses) },
      ],
    },
    {
      title: 'Total Income',
      value: formatCurrency(stats.totalIncome),
      change: stats.incomeChange,
      icon: <TrendingUp className="w-6 h-6" />,
      color: '#22c55e',
      description: 'Sum of all money received from salary, freelance, and investments.',
      breakdown: [
        { label: 'This Month', value: formatCurrency(stats.currentIncome) },
        { label: 'Change vs Last Month', value: `${stats.incomeChange >= 0 ? '+' : ''}${stats.incomeChange.toFixed(1)}%` },
      ],
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(stats.totalExpenses),
      change: stats.expenseChange,
      icon: <TrendingDown className="w-6 h-6" />,
      color: '#f43f5e',
      description: 'Sum of all spending across categories like food, transport, and shopping.',
      breakdown: [
        { label: 'This Month', value: formatCurrency(stats.currentExpenses) },
        { label: 'Transactions', value: `${stats.transactionCount} total` },
      ],
    },
    {
      title: 'Net Savings',
      value: formatCurrency(stats.totalIncome - stats.totalExpenses),
      change: stats.balanceChange,
      icon: <DollarSign className="w-6 h-6" />,
      color: '#a78bfa',
      description: 'Money saved after all expenses. A healthy target is 20%+ savings rate.',
      breakdown: [
        { label: 'Savings Rate', value: `${stats.savingsRate.toFixed(1)}%` },
        { label: 'Status', value: stats.savingsRate >= 20 ? 'Excellent' : stats.savingsRate >= 10 ? 'Good' : 'Needs Attention' },
      ],
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {cards.map((card, index) => (
        <SummaryCard key={card.title} {...card} delay={index * 0.1} />
      ))}
    </div>
  )
}
