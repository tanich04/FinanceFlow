'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts'
import { useFinanceStore, getCategoryColor, getCategoryDescription, formatCurrency, type TransactionCategory } from '@/lib/store'

const renderActiveShape = (props: {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill: string
  payload: { name: string; value: number }
  percent: number
}) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))' }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius - 1}
        fill={fill}
      />
    </g>
  )
}

export default function SpendingBreakdown() {
  const transactions = useFinanceStore((state) => state.transactions)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)

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
        category: category as TransactionCategory,
        value: amount,
        color: getCategoryColor(category as TransactionCategory),
      }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  const totalExpenses = categoryData.reduce((sum, item) => sum + item.value, 0)

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="glass-card glass-card-hover rounded-2xl p-6 h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Spending Breakdown</h3>
          <p className="text-sm text-muted-foreground">Expenses by category</p>
        </div>
        <AnimatePresence>
          {isHovered && totalExpenses > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-right"
            >
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-expense">{formatCurrency(totalExpenses)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {categoryData.length > 0 ? (
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-full lg:w-1/2 h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  activeIndex={activeIndex !== null ? activeIndex : undefined}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center info */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex ?? 'default'}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="text-center">
                  {activeIndex !== null ? (
                    <>
                      <p className="text-xs text-muted-foreground">
                        {categoryData[activeIndex].name}
                      </p>
                      <p 
                        className="text-lg font-bold"
                        style={{ color: categoryData[activeIndex].color }}
                      >
                        {((categoryData[activeIndex].value / totalExpenses) * 100).toFixed(0)}%
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground">Categories</p>
                      <p className="text-lg font-bold text-foreground">{categoryData.length}</p>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="w-full lg:w-1/2 space-y-3">
            {categoryData.slice(0, 5).map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 cursor-pointer ${
                  activeIndex === index ? 'bg-muted/50 scale-[1.02]' : 'hover:bg-muted/30'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <motion.div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                  animate={{ scale: activeIndex === index ? 1.3 : 1 }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-foreground truncate font-medium">{item.name}</span>
                    <span className="text-sm font-semibold ml-2" style={{ color: item.color }}>
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${(item.value / totalExpenses) * 100}%`,
                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.5
                      }}
                      transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Show tooltip for hovered category */}
            <AnimatePresence>
              {activeIndex !== null && categoryData[activeIndex] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-2 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <p className="text-xs text-muted-foreground">
                    {getCategoryDescription(categoryData[activeIndex].category)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <motion.div 
          className="h-[200px] flex flex-col items-center justify-center text-muted-foreground"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-lg">No expenses recorded</p>
          <p className="text-sm">Start tracking your spending</p>
        </motion.div>
      )}
    </motion.div>
  )
}
