'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/layout/header'
import SummaryCards from '@/components/dashboard/summary-cards'
import BalanceChart from '@/components/dashboard/balance-chart'
import SpendingBreakdown from '@/components/dashboard/spending-breakdown'
import RecentTransactions from '@/components/dashboard/recent-transactions'
import TransactionsView from '@/components/transactions/transactions-view'
import InsightsView from '@/components/insights/insights-view'
import ToastNotification from '@/components/ui/toast-notification'
import { useFinanceStore } from '@/lib/store'

// Dynamic import for Three.js scene to avoid SSR issues
const ThreeScene = dynamic(() => import('@/components/three-scene'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 -z-10 bg-background transition-colors duration-500" />
  ),
})

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.98,
    transition: { duration: 0.3 }
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
}

function DashboardView() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      {/* Summary Cards */}
      <motion.div variants={itemVariants}>
        <SummaryCards />
      </motion.div>

      {/* Charts Row */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <BalanceChart />
        <SpendingBreakdown />
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <RecentTransactions />
      </motion.div>
    </motion.div>
  )
}

export default function FinanceDashboard() {
  const activeView = useFinanceStore((state) => state.activeView)
  const theme = useFinanceStore((state) => state.theme)

  // Sync theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

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
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <DashboardView />
              </motion.div>
            )}

            {activeView === 'transactions' && (
              <motion.div
                key="transactions"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <TransactionsView />
              </motion.div>
            )}

            {activeView === 'insights' && (
              <motion.div
                key="insights"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <InsightsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <motion.footer 
          className="relative z-10 py-6 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>FinanceFlow Dashboard - Built for demonstration purposes</p>
        </motion.footer>
      </div>

      {/* Toast Notifications */}
      <ToastNotification />
    </div>
  )
}
