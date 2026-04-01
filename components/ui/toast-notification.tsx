'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useFinanceStore } from '@/lib/store'

export default function ToastNotification() {
  const toast = useFinanceStore((state) => state.toast)
  const clearToast = useFinanceStore((state) => state.clearToast)

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
  }

  const colors = {
    success: 'bg-income/20 border-income text-income',
    error: 'bg-expense/20 border-expense text-expense',
    info: 'bg-primary/20 border-primary text-primary',
  }

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 glass-card shadow-2xl ${colors[toast.type]}`}
          >
            {(() => {
              const Icon = icons[toast.type]
              return <Icon className="w-5 h-5" />
            })()}
            <p className="font-medium text-foreground">{toast.message}</p>
            <button
              onClick={clearToast}
              className="ml-2 p-1 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
