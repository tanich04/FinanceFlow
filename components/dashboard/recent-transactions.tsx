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
  Eye,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useFinanceStore, formatCurrency, formatDate, getCategoryDescription, type TransactionCategory, type Transaction } from '@/lib/store'

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
  const setSelectedTransaction = useFinanceStore((state) => state.setSelectedTransaction)
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

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setActiveView('transactions')
  }

  const handleViewAll = () => {
    setSelectedTransaction(null)
    setActiveView('transactions')
  }

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass-card glass-card-hover rounded-2xl p-4 sm:p-6 h-full"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Recent Transactions</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Your latest activity</p>
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
            onClick={handleViewAll}
            className="flex items-center gap-1 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors group"
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.95 }}
          >
            View All
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>

        {/* Hint text */}
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Click any transaction to view details
        </p>

        {recentTransactions.length > 0 ? (
          <div className="space-y-1 sm:space-y-2">
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
                          scale: isHovered ? 1.02 : 1,
                          backgroundColor: isHovered ? 'var(--muted)' : 'rgba(0,0,0,0)'
                        }}
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                        className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98]"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => handleTransactionClick(transaction)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleTransactionClick(transaction)}
                      >
                        <motion.div
                          className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
                            isIncome ? 'bg-income/20' : 'bg-expense/20'
                          }`}
                          animate={{ 
                            scale: isHovered ? 1.1 : 1,
                            rotate: isHovered ? 5 : 0 
                          }}
                        >
                          <IconComponent
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              isIncome ? 'text-income' : 'text-expense'
                            }`}
                          />
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs sm:text-sm font-medium truncate transition-colors ${
                            isHovered ? 'text-primary' : 'text-foreground'
                          }`}>
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatDate(transaction.date)}
                            <span className="hidden sm:inline"> • {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                          <motion.div 
                            className="flex items-center gap-0.5 sm:gap-1"
                            animate={{ scale: isHovered ? 1.05 : 1 }}
                          >
                            {isIncome ? (
                              <motion.div
                                animate={{ y: isHovered ? -2 : 0 }}
                              >
                                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-income" />
                              </motion.div>
                            ) : (
                              <motion.div
                                animate={{ y: isHovered ? 2 : 0 }}
                              >
                                <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-expense" />
                              </motion.div>
                            )}
                            <span
                              className={`text-xs sm:text-sm font-semibold ${
                                isIncome ? 'text-income' : 'text-expense'
                              }`}
                            >
                              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </span>
                          </motion.div>
                          
                          {/* Click indicator */}
                          <motion.div
                            className="text-muted-foreground"
                            animate={{ 
                              x: isHovered ? [0, 3, 0] : 0,
                              opacity: isHovered ? 1 : 0.3
                            }}
                            transition={{ 
                              x: { duration: 0.6, repeat: Infinity },
                              opacity: { duration: 0.2 }
                            }}
                          >
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                          </motion.div>
                        </div>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="glass-card max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {getCategoryDescription(transaction.category)}
                        </p>
                        <p className="text-xs text-primary font-medium">
                          Click to view full details
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
            className="h-[180px] sm:h-[200px] flex flex-col items-center justify-center text-muted-foreground"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 mb-3 opacity-50" />
            <p className="text-base sm:text-lg">No transactions yet</p>
            <p className="text-xs sm:text-sm">Start tracking your finances</p>
          </motion.div>
        )}
      </motion.div>
    </TooltipProvider>
  )
}
