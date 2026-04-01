'use client'

import { useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  Search,
  Filter,
  ArrowUpDown,
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
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  type TransactionCategory,
  type Transaction,
} from '@/lib/store'
import TransactionModal from './transaction-modal'
import TransactionDetail from './transaction-detail'

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

const categories: TransactionCategory[] = [
  'salary', 'freelance', 'investment', 'food', 'transport',
  'entertainment', 'shopping', 'utilities', 'healthcare', 'other'
]

function FilterPill({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean
  onClick: () => void
  children: React.ReactNode 
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`filter-pill ${active ? 'filter-pill-active' : 'filter-pill-inactive'}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      {children}
    </motion.button>
  )
}

function TransactionRow({ 
  transaction, 
  index, 
  onEdit, 
  onDelete,
  onSelect,
  isAdmin,
  isPending 
}: { 
  transaction: Transaction
  index: number
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => void
  onSelect: (t: Transaction) => void
  isAdmin: boolean
  isPending: boolean
}) {
  const IconComponent = categoryIcons[transaction.category]
  const isIncome = transaction.type === 'income'
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    onDelete(transaction.id)
  }, [onDelete, transaction.id])

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(transaction)
  }, [onEdit, transaction])

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ 
          opacity: isPending ? 0.5 : 1, 
          x: 0,
          scale: isDeleting ? 0.95 : 1,
        }}
        exit={{ opacity: 0, x: 20, height: 0 }}
        transition={{ duration: 0.3, delay: index * 0.02 }}
        className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 hover:bg-muted/20 transition-all duration-300 group cursor-pointer rounded-xl ${
          isPending ? 'animate-pulse' : ''
        }`}
        onClick={() => onSelect(transaction)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(transaction)}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={`p-2 sm:p-3 rounded-xl cursor-help transition-all duration-300 group-hover:scale-110 ${
                isIncome ? 'bg-income/20' : 'bg-expense/20'
              }`}
              whileHover={{ rotate: 5 }}
            >
              <IconComponent
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  isIncome ? 'text-income' : 'text-expense'
                }`}
              />
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="right" className="glass-card">
            <div className="space-y-1">
              <p className="font-medium capitalize">{transaction.category}</p>
              <p className="text-xs text-muted-foreground">
                {getCategoryDescription(transaction.category)}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate text-sm sm:text-base group-hover:text-primary transition-colors">
            {transaction.description}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {formatDate(transaction.date)}
            <span className="hidden sm:inline"> • {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <motion.div 
            className="flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            {isIncome ? (
              <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-income" />
            ) : (
              <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-expense" />
            )}
            <span
              className={`text-sm sm:text-base font-semibold ${
                isIncome ? 'text-income' : 'text-expense'
              }`}
            >
              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </span>
          </motion.div>

          {/* View Details Indicator */}
          <motion.div 
            className="hidden sm:flex items-center text-muted-foreground group-hover:text-primary transition-colors"
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>

          {isAdmin && (
            <motion.div 
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={handleEdit}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-primary/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Pencil className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>Edit transaction</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={handleDelete}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-destructive animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>Delete transaction</TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </div>
      </motion.div>
    </TooltipProvider>
  )
}

export default function TransactionsView() {
  const transactions = useFinanceStore((state) => state.transactions)
  const filters = useFinanceStore((state) => state.filters)
  const setFilters = useFinanceStore((state) => state.setFilters)
  const resetFilters = useFinanceStore((state) => state.resetFilters)
  const role = useFinanceStore((state) => state.role)
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction)
  const pendingTransactions = useFinanceStore((state) => state.pendingTransactions)
  const selectedTransaction = useFinanceStore((state) => state.selectedTransaction)
  const setSelectedTransaction = useFinanceStore((state) => state.setSelectedTransaction)

  const [showFilters, setShowFilters] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const hasActiveFilters = filters.search || filters.type !== 'all' || filters.category !== 'all'

  const filteredTransactions = useMemo(() => {
    let result = [...transactions]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower)
      )
    }

    // Type filter
    if (filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type)
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter((t) => t.category === filters.category)
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0
      if (filters.sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else {
        comparison = a.amount - b.amount
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [transactions, filters])

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteTransaction(id)
  }

  const handleSelectTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
  }

  const handleBackFromDetail = () => {
    setSelectedTransaction(null)
  }

  const handleEditFromDetail = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    return { income, expense, net: income - expense }
  }, [filteredTransactions])

  // If a transaction is selected, show the detail view
  if (selectedTransaction) {
    return (
      <>
        <TransactionDetail 
          transaction={selectedTransaction}
          onBack={handleBackFromDetail}
          onEdit={role === 'admin' ? handleEditFromDetail : undefined}
        />
        <TransactionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          transaction={editingTransaction}
        />
      </>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Transactions</h2>
          <p className="text-sm text-muted-foreground">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} 
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>
        {role === 'admin' && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary-cta gap-2 px-4 sm:px-6 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          </motion.div>
        )}
      </div>

      {/* Quick Stats - Responsive */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <motion.div 
          className="glass-card rounded-xl p-3 sm:p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-xs text-muted-foreground mb-1">Income</p>
          <p className="text-sm sm:text-lg font-bold text-income">{formatCurrency(totals.income)}</p>
        </motion.div>
        <motion.div 
          className="glass-card rounded-xl p-3 sm:p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-xs text-muted-foreground mb-1">Expenses</p>
          <p className="text-sm sm:text-lg font-bold text-expense">{formatCurrency(totals.expense)}</p>
        </motion.div>
        <motion.div 
          className="glass-card rounded-xl p-3 sm:p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-xs text-muted-foreground mb-1">Net</p>
          <p className={`text-sm sm:text-lg font-bold ${totals.net >= 0 ? 'text-income' : 'text-expense'}`}>
            {formatCurrency(totals.net)}
          </p>
        </motion.div>
      </div>

      {/* Search and Filters - Responsive */}
      <motion.div 
        className="glass-card rounded-2xl p-3 sm:p-4"
        layout
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-10 bg-muted/50 border-border/50 transition-all focus:ring-2 focus:ring-primary/20"
            />
            {filters.search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setFilters({ search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
              </motion.button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`gap-2 border-border/50 transition-all flex-1 sm:flex-initial ${
                      showFilters ? 'bg-primary/10 border-primary/30' : 'bg-muted/30'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {hasActiveFilters && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                    <motion.div
                      animate={{ rotate: showFilters ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle filter options</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
                    })}
                    className="gap-2 border-border/50 bg-muted/30 hover:bg-muted/50 flex-1 sm:flex-initial"
                  >
                    <motion.div
                      animate={{ rotate: filters.sortOrder === 'asc' ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </motion.div>
                    <span className="hidden sm:inline">{filters.sortOrder === 'asc' ? 'Oldest' : 'Newest'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Change sort order</TooltipContent>
              </Tooltip>

              {hasActiveFilters && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Button
                        variant="ghost"
                        onClick={resetFilters}
                        className="gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="hidden sm:inline">Reset</span>
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Clear all filters</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        </div>

        {/* Filter Options - Responsive */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <LayoutGroup>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 pt-4 mt-4 border-t border-border/50">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground font-medium">Type</label>
                    <div className="flex gap-2 flex-wrap">
                      {['all', 'income', 'expense'].map((type) => (
                        <FilterPill
                          key={type}
                          active={filters.type === type}
                          onClick={() => setFilters({ type: type as 'all' | 'income' | 'expense' })}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </FilterPill>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground font-medium">Category</label>
                    <div className="flex flex-wrap gap-2">
                      <FilterPill
                        active={filters.category === 'all'}
                        onClick={() => setFilters({ category: 'all' })}
                      >
                        All
                      </FilterPill>
                      {categories.map((category) => (
                        <FilterPill
                          key={category}
                          active={filters.category === category}
                          onClick={() => setFilters({ category })}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </FilterPill>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground font-medium">Sort By</label>
                    <div className="flex gap-2">
                      {['date', 'amount'].map((sort) => (
                        <FilterPill
                          key={sort}
                          active={filters.sortBy === sort}
                          onClick={() => setFilters({ sortBy: sort as 'date' | 'amount' })}
                        >
                          {sort.charAt(0).toUpperCase() + sort.slice(1)}
                        </FilterPill>
                      ))}
                    </div>
                  </div>
                </div>
              </LayoutGroup>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Transactions List */}
      <motion.div 
        className="glass-card rounded-2xl overflow-hidden"
        layout
      >
        {/* Click hint */}
        <div className="px-4 py-2 bg-muted/30 border-b border-border/30">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Click on a transaction to view details
          </p>
        </div>
        
        <AnimatePresence mode="popLayout">
          {filteredTransactions.length > 0 ? (
            <LayoutGroup>
              <div className="divide-y divide-border/30">
                {filteredTransactions.map((transaction, index) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    index={index}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSelect={handleSelectTransaction}
                    isAdmin={role === 'admin'}
                    isPending={pendingTransactions.has(transaction.id)}
                  />
                ))}
              </div>
            </LayoutGroup>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 sm:py-16 text-muted-foreground px-4"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Search className="w-10 h-10 sm:w-12 sm:h-12 mb-4 opacity-50" />
              </motion.div>
              <p className="text-base sm:text-lg font-medium text-center">No transactions found</p>
              <p className="text-sm mb-4 text-center">Try adjusting your search or filters</p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        transaction={editingTransaction}
      />
    </motion.div>
  )
}
