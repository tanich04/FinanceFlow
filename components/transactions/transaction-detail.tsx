'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Laptop,
  UtensilsCrossed,
  Car,
  Film,
  ShoppingBag,
  Zap,
  Heart,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  PieChart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  useFinanceStore,
  formatCurrency,
  formatDate,
  getCategoryDescription,
  getCategoryColor,
  type TransactionCategory,
  type Transaction,
} from '@/lib/store'

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

interface TransactionDetailProps {
  transaction: Transaction
  onBack: () => void
  onEdit?: (transaction: Transaction) => void
}

export default function TransactionDetail({ transaction, onBack, onEdit }: TransactionDetailProps) {
  const role = useFinanceStore((state) => state.role)
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction)
  const transactions = useFinanceStore((state) => state.transactions)
  
  const IconComponent = categoryIcons[transaction.category]
  const isIncome = transaction.type === 'income'
  const categoryColor = getCategoryColor(transaction.category)
  
  // Calculate related stats
  const relatedStats = useMemo(() => {
    const sameCategory = transactions.filter(t => t.category === transaction.category)
    const sameCategoryTotal = sameCategory.reduce((sum, t) => 
      sum + (t.type === 'income' ? t.amount : -t.amount), 0
    )
    const avgAmount = sameCategory.reduce((sum, t) => sum + t.amount, 0) / sameCategory.length
    const transactionRank = sameCategory
      .sort((a, b) => b.amount - a.amount)
      .findIndex(t => t.id === transaction.id) + 1
    
    return {
      categoryTotal: Math.abs(sameCategoryTotal),
      categoryCount: sameCategory.length,
      avgAmount,
      rank: transactionRank,
      percentOfCategory: (transaction.amount / sameCategory.reduce((sum, t) => sum + t.amount, 0)) * 100,
    }
  }, [transactions, transaction])

  const handleDelete = () => {
    deleteTransaction(transaction.id)
    onBack()
  }

  return (
    <TooltipProvider delayDuration={200}>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-6"
      >
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={onBack}
              className="gap-2 border-border/50 bg-muted/30 hover:bg-muted/50 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Back to Transactions</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </motion.div>
          
          <div className="flex-1" />
          
          {role === 'admin' && (
            <div className="flex gap-2">
              {onEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={() => onEdit(transaction)}
                        className="gap-2 border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary"
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Edit this transaction</TooltipContent>
                </Tooltip>
              )}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={handleDelete}
                      className="gap-2 border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>Delete this transaction</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Main Detail Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          {/* Transaction Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pb-6 border-b border-border/30">
            <motion.div
              className={`p-4 rounded-2xl ${isIncome ? 'bg-income/20' : 'bg-expense/20'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <IconComponent
                className={`w-8 h-8 ${isIncome ? 'text-income' : 'text-expense'}`}
              />
            </motion.div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {transaction.description}
              </h2>
              <p className="text-muted-foreground">
                {getCategoryDescription(transaction.category)}
              </p>
            </div>
            
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {isIncome ? (
                <ArrowUpRight className="w-6 h-6 text-income" />
              ) : (
                <ArrowDownRight className="w-6 h-6 text-expense" />
              )}
              <span className={`text-3xl font-bold ${isIncome ? 'text-income' : 'text-expense'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
              </span>
            </motion.div>
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="glass-card rounded-xl p-4 cursor-help hover:bg-muted/20 transition-all"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Date</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {formatDate(transaction.date)}
                  </p>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Transaction recorded on this date</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="glass-card rounded-xl p-4 cursor-help hover:bg-muted/20 transition-all"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Tag className="w-5 h-5" style={{ color: categoryColor }} />
                    <span className="text-sm text-muted-foreground">Category</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground capitalize">
                    {transaction.category}
                  </p>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getCategoryDescription(transaction.category)}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="glass-card rounded-xl p-4 cursor-help hover:bg-muted/20 transition-all"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {isIncome ? (
                      <TrendingUp className="w-5 h-5 text-income" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-expense" />
                    )}
                    <span className="text-sm text-muted-foreground">Type</span>
                  </div>
                  <p className={`text-lg font-semibold capitalize ${isIncome ? 'text-income' : 'text-expense'}`}>
                    {transaction.type}
                  </p>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isIncome ? 'Money received' : 'Money spent'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="glass-card rounded-xl p-4 cursor-help hover:bg-muted/20 transition-all"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Amount</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(transaction.amount)}
                  </p>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Transaction value</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        {/* Related Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Category Insights
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="text-center p-4 rounded-xl bg-muted/30 cursor-help hover:bg-muted/50 transition-all"
                  whileHover={{ scale: 1.03 }}
                >
                  <p className="text-2xl font-bold text-foreground">
                    {relatedStats.categoryCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.category} transactions
                  </p>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total transactions in {transaction.category} category</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="text-center p-4 rounded-xl bg-muted/30 cursor-help hover:bg-muted/50 transition-all"
                  whileHover={{ scale: 1.03 }}
                >
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(relatedStats.avgAmount)}
                  </p>
                  <p className="text-sm text-muted-foreground">Average amount</p>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Average transaction amount in this category</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="text-center p-4 rounded-xl bg-muted/30 cursor-help hover:bg-muted/50 transition-all"
                  whileHover={{ scale: 1.03 }}
                >
                  <p className="text-2xl font-bold text-foreground">
                    #{relatedStats.rank}
                  </p>
                  <p className="text-sm text-muted-foreground">Rank by amount</p>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>This transaction ranks #{relatedStats.rank} by amount in its category</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="text-center p-4 rounded-xl bg-muted/30 cursor-help hover:bg-muted/50 transition-all"
                  whileHover={{ scale: 1.03 }}
                >
                  <p className="text-2xl font-bold text-foreground">
                    {relatedStats.percentOfCategory.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Of category total</p>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>This transaction makes up {relatedStats.percentOfCategory.toFixed(1)}% of all {transaction.category} spending</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        {/* Description */}
        {transaction.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Description
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {transaction.description}
            </p>
          </motion.div>
        )}
      </motion.div>
    </TooltipProvider>
  )
}
