'use client'

import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/layout/header'
import SummaryCards from '@/components/dashboard/summary-cards'
import BalanceChart from '@/components/dashboard/balance-chart'
import SpendingBreakdown from '@/components/dashboard/spending-breakdown'
import RecentTransactions from '@/components/dashboard/recent-transactions'
import TransactionsView from '@/components/transactions/transactions-view'
import InsightsView from '@/components/insights/insights-view'
import { useFinanceStore } from '@/lib/store'

// Dynamic import for Three.js scene to avoid SSR issues
const ThreeScene = dynamic(() => import('@/components/three-scene'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 -z-10 bg-background" />
  ),
})

function DashboardView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <SummaryCards />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceChart />
        <SpendingBreakdown />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
    </motion.div>
  )
}

export default function FinanceDashboard() {
  const activeView = useFinanceStore((state) => state.activeView)

  return (
    <div className="min-h-screen relative">
      {/* 3D Background */}
      <ThreeScene />

      {/* Main Content */}
      <div className="relative z-10">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardView />
              </motion.div>
            )}

            {activeView === 'transactions' && (
              <motion.div
                key="transactions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TransactionsView />
              </motion.div>
            )}

            {activeView === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <InsightsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-6 text-center text-sm text-muted-foreground">
          <p>FinanceFlow Dashboard - Built for demonstration purposes</p>
        </footer>
      </div>
    </div>
  )
}
