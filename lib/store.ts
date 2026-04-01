import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TransactionType = 'income' | 'expense'
export type UserRole = 'viewer' | 'admin'
export type Theme = 'light' | 'dark'
export type TransactionCategory = 
  | 'salary' 
  | 'freelance' 
  | 'investment' 
  | 'food' 
  | 'transport' 
  | 'entertainment' 
  | 'shopping' 
  | 'utilities' 
  | 'healthcare' 
  | 'other'

export interface Transaction {
  id: string
  date: string
  amount: number
  category: TransactionCategory
  type: TransactionType
  description: string
}

export interface FilterState {
  search: string
  type: TransactionType | 'all'
  category: TransactionCategory | 'all'
  sortBy: 'date' | 'amount'
  sortOrder: 'asc' | 'desc'
}

interface FinanceStore {
  // Transactions
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id'>) => string
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  
  // Selected transaction for detail view
  selectedTransaction: Transaction | null
  setSelectedTransaction: (transaction: Transaction | null) => void
  
  // Role
  role: UserRole
  setRole: (role: UserRole) => void
  
  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  
  // Filters
  filters: FilterState
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  
  // UI State
  activeView: 'dashboard' | 'transactions' | 'insights'
  setActiveView: (view: 'dashboard' | 'transactions' | 'insights') => void
  
  // Loading states for optimistic UI
  pendingTransactions: Set<string>
  addPendingTransaction: (id: string) => void
  removePendingTransaction: (id: string) => void
  
  // Toast notifications
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
  clearToast: () => void
}

const defaultFilters: FilterState = {
  search: '',
  type: 'all',
  category: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
}

// Mock data for demonstration
const mockTransactions: Transaction[] = [
  { id: '1', date: '2026-04-01', amount: 5000, category: 'salary', type: 'income', description: 'Monthly Salary' },
  { id: '2', date: '2026-03-28', amount: 1200, category: 'freelance', type: 'income', description: 'Web Development Project' },
  { id: '3', date: '2026-03-25', amount: 150, category: 'food', type: 'expense', description: 'Grocery Shopping' },
  { id: '4', date: '2026-03-22', amount: 50, category: 'transport', type: 'expense', description: 'Uber Rides' },
  { id: '5', date: '2026-03-20', amount: 200, category: 'entertainment', type: 'expense', description: 'Concert Tickets' },
  { id: '6', date: '2026-03-18', amount: 800, category: 'shopping', type: 'expense', description: 'New Laptop Accessories' },
  { id: '7', date: '2026-03-15', amount: 120, category: 'utilities', type: 'expense', description: 'Electricity Bill' },
  { id: '8', date: '2026-03-12', amount: 2500, category: 'investment', type: 'income', description: 'Stock Dividends' },
  { id: '9', date: '2026-03-10', amount: 75, category: 'healthcare', type: 'expense', description: 'Pharmacy' },
  { id: '10', date: '2026-03-08', amount: 300, category: 'food', type: 'expense', description: 'Restaurant Dinner' },
  { id: '11', date: '2026-03-05', amount: 1500, category: 'freelance', type: 'income', description: 'Design Consultation' },
  { id: '12', date: '2026-03-01', amount: 5000, category: 'salary', type: 'income', description: 'Monthly Salary' },
  { id: '13', date: '2026-02-28', amount: 450, category: 'shopping', type: 'expense', description: 'Clothing' },
  { id: '14', date: '2026-02-25', amount: 60, category: 'entertainment', type: 'expense', description: 'Netflix & Spotify' },
  { id: '15', date: '2026-02-20', amount: 180, category: 'utilities', type: 'expense', description: 'Internet Bill' },
  { id: '16', date: '2026-02-15', amount: 3000, category: 'investment', type: 'income', description: 'Crypto Gains' },
  { id: '17', date: '2026-02-10', amount: 90, category: 'transport', type: 'expense', description: 'Gas' },
  { id: '18', date: '2026-02-05', amount: 250, category: 'healthcare', type: 'expense', description: 'Doctor Visit' },
  { id: '19', date: '2026-02-01', amount: 5000, category: 'salary', type: 'income', description: 'Monthly Salary' },
  { id: '20', date: '2026-01-28', amount: 400, category: 'other', type: 'expense', description: 'Miscellaneous' },
]

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      transactions: mockTransactions,
      
      addTransaction: (transaction) => {
        const id = crypto.randomUUID()
        set((state) => ({
          transactions: [
            { ...transaction, id },
            ...state.transactions,
          ],
        }))
        get().showToast('Transaction added successfully', 'success')
        return id
      },
      
      updateTransaction: (id, updatedTransaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updatedTransaction } : t
          ),
        }))
        get().showToast('Transaction updated', 'success')
      },
      
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
          selectedTransaction: state.selectedTransaction?.id === id ? null : state.selectedTransaction,
        }))
        get().showToast('Transaction deleted', 'info')
      },
      
      selectedTransaction: null,
      setSelectedTransaction: (transaction) => set({ selectedTransaction: transaction }),
      
      role: 'admin',
      setRole: (role) => set({ role }),
      
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme })
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark')
        }
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: newTheme })
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newTheme === 'dark')
        }
      },
      
      filters: defaultFilters,
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),
      
      activeView: 'dashboard',
      setActiveView: (activeView) => set({ activeView }),
      
      // Optimistic UI states
      pendingTransactions: new Set(),
      addPendingTransaction: (id) => 
        set((state) => ({
          pendingTransactions: new Set([...state.pendingTransactions, id])
        })),
      removePendingTransaction: (id) =>
        set((state) => {
          const newSet = new Set(state.pendingTransactions)
          newSet.delete(id)
          return { pendingTransactions: newSet }
        }),
      
      // Toast
      toast: null,
      showToast: (message, type) => {
        set({ toast: { message, type } })
        setTimeout(() => set({ toast: null }), 3000)
      },
      clearToast: () => set({ toast: null }),
    }),
    {
      name: 'finance-dashboard-storage',
      partialize: (state) => ({
        transactions: state.transactions,
        role: state.role,
        theme: state.theme,
        filters: state.filters,
        activeView: state.activeView,
      }),
    }
  )
)

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const getCategoryIcon = (category: TransactionCategory): string => {
  const icons: Record<TransactionCategory, string> = {
    salary: 'Briefcase',
    freelance: 'Laptop',
    investment: 'TrendingUp',
    food: 'UtensilsCrossed',
    transport: 'Car',
    entertainment: 'Film',
    shopping: 'ShoppingBag',
    utilities: 'Zap',
    healthcare: 'Heart',
    other: 'MoreHorizontal',
  }
  return icons[category]
}

export const getCategoryColor = (category: TransactionCategory): string => {
  const colors: Record<TransactionCategory, string> = {
    salary: '#2dd4bf',
    freelance: '#22d3ee',
    investment: '#a78bfa',
    food: '#fb923c',
    transport: '#60a5fa',
    entertainment: '#f472b6',
    shopping: '#fbbf24',
    utilities: '#4ade80',
    healthcare: '#f87171',
    other: '#94a3b8',
  }
  return colors[category]
}

export const getCategoryDescription = (category: TransactionCategory): string => {
  const descriptions: Record<TransactionCategory, string> = {
    salary: 'Regular employment income',
    freelance: 'Independent contractor work',
    investment: 'Returns from investments',
    food: 'Groceries and dining',
    transport: 'Travel and commuting',
    entertainment: 'Movies, games, events',
    shopping: 'Retail purchases',
    utilities: 'Bills and services',
    healthcare: 'Medical expenses',
    other: 'Miscellaneous items',
  }
  return descriptions[category]
}
