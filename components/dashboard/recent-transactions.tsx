'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Laptop,
  TrendingUp,
  UtensilsCrossed,
  Car,
  Film,
  ShoppingBag,
  Zap,
  Heart,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useFinanceStore, formatCurrency, formatDate, type TransactionCategory } from '@/lib/store'

const categoryIcons: Record<TransactionCategory, React.ComponentType<{ className?: string }>> = {
  salary: Briefcase,
  freelance: Laptop,
  investment: TrendingUp,
  food: UtensilsCrossed,
  transport: Car,
  entertainment: Film,
  shopping: ShoppingBag,
  utilities: Zap,
  healthcare: Heart,
  other: MoreHorizontal,
}

export default function RecentTransactions() {
  const transactions = useFinanceStore((state) => state.transactions)
  const setActiveView = useFinanceStore((state) => state.setActiveView)

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [transactions])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="glass-card rounded-2xl p-6 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">Your latest activity</p>
        </div>
        <button
          onClick={() => setActiveView('transactions')}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View All
        </button>
      </div>

      {recentTransactions.length > 0 ? (
        <div className="space-y-4">
          {recentTransactions.map((transaction, index) => {
            const IconComponent = categoryIcons[transaction.category]
            const isIncome = transaction.type === 'income'

            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors"
              >
                <div
                  className={`p-2.5 rounded-xl ${
                    isIncome ? 'bg-income/20' : 'bg-expense/20'
                  }`}
                >
                  <IconComponent
                    className={`w-5 h-5 ${
                      isIncome ? 'text-income' : 'text-expense'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.date)} • {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {isIncome ? (
                    <ArrowUpRight className="w-4 h-4 text-income" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-expense" />
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      isIncome ? 'text-income' : 'text-expense'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          No transactions yet
        </div>
      )}
    </motion.div>
  )
}
