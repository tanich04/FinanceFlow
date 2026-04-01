'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  X,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useFinanceStore,
  formatCurrency,
  formatDate,
  type TransactionCategory,
  type Transaction,
} from '@/lib/store'
import TransactionModal from './transaction-modal'

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

export default function TransactionsView() {
  const transactions = useFinanceStore((state) => state.transactions)
  const filters = useFinanceStore((state) => state.filters)
  const setFilters = useFinanceStore((state) => state.setFilters)
  const role = useFinanceStore((state) => state.role)
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction)

  const [showFilters, setShowFilters] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

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
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Transactions</h2>
          <p className="text-muted-foreground">Manage your financial activity</p>
        </div>
        {role === 'admin' && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-10 bg-muted/50 border-border/50"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 border-border/50 bg-muted/30"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            <Button
              variant="outline"
              onClick={() => setFilters({
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
              })}
              className="gap-2 border-border/50 bg-muted/30"
            >
              <ArrowUpDown className="w-4 h-4" />
              {filters.sortOrder === 'asc' ? 'Oldest' : 'Newest'}
            </Button>
          </div>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-border/50">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Type</label>
                  <div className="flex gap-2">
                    {['all', 'income', 'expense'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilters({ type: type as 'all' | 'income' | 'expense' })}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          filters.type === type
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Category</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilters({ category: 'all' })}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        filters.category === 'all'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setFilters({ category })}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          filters.category === category
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Sort By</label>
                  <div className="flex gap-2">
                    {['date', 'amount'].map((sort) => (
                      <button
                        key={sort}
                        onClick={() => setFilters({ sortBy: sort as 'date' | 'amount' })}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          filters.sortBy === sort
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {sort.charAt(0).toUpperCase() + sort.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transactions List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-border/30">
            {filteredTransactions.map((transaction, index) => {
              const IconComponent = categoryIcons[transaction.category]
              const isIncome = transaction.type === 'income'

              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors"
                >
                  <div
                    className={`p-3 rounded-xl ${
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
                    <p className="font-medium text-foreground truncate">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.date)} • {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4 text-income" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-expense" />
                      )}
                      <span
                        className={`font-semibold ${
                          isIncome ? 'text-income' : 'text-expense'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>

                    {role === 'admin' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        transaction={editingTransaction}
      />
    </motion.div>
  )
}
