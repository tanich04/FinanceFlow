'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useFinanceStore, getCategoryColor, formatCurrency, type TransactionCategory } from '@/lib/store'

export default function SpendingBreakdown() {
  const transactions = useFinanceStore((state) => state.transactions)

  const categoryData = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense')
    const categoryTotals: Record<string, number> = {}

    expenses.forEach((t) => {
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = 0
      }
      categoryTotals[t.category] += t.amount
    })

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: amount,
        color: getCategoryColor(category as TransactionCategory),
      }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  const totalExpenses = categoryData.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; color: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / totalExpenses) * 100).toFixed(1)
      return (
        <div className="glass-card rounded-lg p-3 border border-border/50">
          <p className="text-foreground font-medium">{data.name}</p>
          <p className="text-sm" style={{ color: data.color }}>
            {formatCurrency(data.value)} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="glass-card rounded-2xl p-6 h-full"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Spending Breakdown</h3>
        <p className="text-sm text-muted-foreground">Expenses by category</p>
      </div>

      {categoryData.length > 0 ? (
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-full lg:w-1/2 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full lg:w-1/2 space-y-3">
            {categoryData.slice(0, 5).map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-foreground truncate">{item.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {((item.value / totalExpenses) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / totalExpenses) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          No expenses recorded
        </div>
      )}
    </motion.div>
  )
}
