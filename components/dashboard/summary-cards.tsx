'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { useFinanceStore, formatCurrency } from '@/lib/store'

interface SummaryCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  color: string
  delay: number
}

function SummaryCard({ title, value, change, icon, color, delay }: SummaryCardProps) {
  const isPositive = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      whileHover={{ 
        scale: 1.02, 
        rotateY: 5,
        transition: { duration: 0.2 }
      }}
      className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden"
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
    >
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 opacity-20 rounded-2xl"
        style={{ 
          background: `linear-gradient(135deg, ${color}40 0%, transparent 60%)` 
        }}
      />
      
      {/* Glow effect */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: color }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-income' : 'text-expense'
          }`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-1">{title}</p>
        <p className="text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
      </div>
    </motion.div>
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

    return {
      balance,
      totalIncome,
      totalExpenses,
      incomeChange,
      expenseChange,
      balanceChange,
    }
  }, [transactions])

  const cards = [
    {
      title: 'Total Balance',
      value: formatCurrency(stats.balance),
      change: stats.balanceChange,
      icon: <Wallet className="w-6 h-6" />,
      color: '#2dd4bf',
    },
    {
      title: 'Total Income',
      value: formatCurrency(stats.totalIncome),
      change: stats.incomeChange,
      icon: <TrendingUp className="w-6 h-6" />,
      color: '#22c55e',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(stats.totalExpenses),
      change: stats.expenseChange,
      icon: <TrendingDown className="w-6 h-6" />,
      color: '#f43f5e',
    },
    {
      title: 'Net Savings',
      value: formatCurrency(stats.totalIncome - stats.totalExpenses),
      change: stats.balanceChange,
      icon: <DollarSign className="w-6 h-6" />,
      color: '#a78bfa',
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
