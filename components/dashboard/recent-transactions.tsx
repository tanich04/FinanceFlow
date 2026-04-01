'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useFinanceStore, formatCurrency, formatDate, getCategoryDescription, type TransactionCategory } from '@/lib/store'

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [transactions])

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return transactions.filter(t => t.date === today).length
  }, [transactions])

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass-card glass-card-hover rounded-2xl p-6 h-full"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
              <p className="text-sm text-muted-foreground">Your latest activity</p>
            </div>
            {todayCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium"
              >
                <Sparkles className="w-3 h-3" />
                {todayCount} today
              </motion.div>
            )}
          </div>
          <motion.button
            onClick={() => setActiveView('transactions')}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors group"
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.95 }}
          >
            View All
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-2">
            <AnimatePresence>
              {recentTransactions.map((transaction, index) => {
                const IconComponent = categoryIcons[transaction.category]
                const isIncome = transaction.type === 'income'
                const isHovered = hoveredIndex === index

                return (
                  <Tooltip key={transaction.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          scale: isHovered ? 1.01 : 1,
                          backgroundColor: isHovered ? 'var(--muted)' : 'transparent'
                        }}
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                        className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => setActiveView('transactions')}
                      >
                        <motion.div
                          className={`p-2.5 rounded-xl transition-all duration-300 ${
                            isIncome ? 'bg-income/20' : 'bg-expense/20'
                          }`}
                          animate={{ 
                            scale: isHovered ? 1.1 : 1,
                            rotate: isHovered ? 5 : 0 
                          }}
                        >
                          <IconComponent
                            className={`w-5 h-5 ${
                              isIncome ? 'text-income' : 'text-expense'
                            }`}
                          />
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate transition-colors ${
                            isHovered ? 'text-primary' : 'text-foreground'
                          }`}>
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.date)} • {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                          </p>
                        </div>

                        <motion.div 
                          className="flex items-center gap-1"
                          animate={{ scale: isHovered ? 1.05 : 1 }}
                        >
                          {isIncome ? (
                            <motion.div
                              animate={{ y: isHovered ? -2 : 0 }}
                            >
                              <ArrowUpRight className="w-4 h-4 text-income" />
                            </motion.div>
                          ) : (
                            <motion.div
                              animate={{ y: isHovered ? 2 : 0 }}
                            >
                              <ArrowDownRight className="w-4 h-4 text-expense" />
                            </motion.div>
                          )}
                          <span
                            className={`text-sm font-semibold ${
                              isIncome ? 'text-income' : 'text-expense'
                            }`}
                          >
                            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </motion.div>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="glass-card max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {getCategoryDescription(transaction.category)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Click to view all transactions
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            className="h-[200px] flex flex-col items-center justify-center text-muted-foreground"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-lg">No transactions yet</p>
            <p className="text-sm">Start tracking your finances</p>
          </motion.div>
        )}
      </motion.div>
    </TooltipProvider>
  )
}
