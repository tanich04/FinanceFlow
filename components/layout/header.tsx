'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Receipt,
  Lightbulb,
  User,
  Shield,
  Menu,
  X,
  ChevronDown,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFinanceStore, type UserRole } from '@/lib/store'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
] as const

export default function Header() {
  const activeView = useFinanceStore((state) => state.activeView)
  const setActiveView = useFinanceStore((state) => state.setActiveView)
  const role = useFinanceStore((state) => state.role)
  const setRole = useFinanceStore((state) => state.setRole)
  const transactions = useFinanceStore((state) => state.transactions)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleExport = (format: 'csv' | 'json') => {
    const data = transactions.map(t => ({
      date: t.date,
      description: t.description,
      category: t.category,
      type: t.type,
      amount: t.amount,
    }))

    let content: string
    let filename: string
    let mimeType: string

    if (format === 'csv') {
      const headers = ['Date', 'Description', 'Category', 'Type', 'Amount']
      const rows = data.map(t => [t.date, t.description, t.category, t.type, t.amount.toString()])
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      filename = 'transactions.csv'
      mimeType = 'text/csv'
    } else {
      content = JSON.stringify(data, null, 2)
      filename = 'transactions.json'
      mimeType = 'application/json'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-lg bg-primary" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">FinanceFlow</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeView === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Export Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex gap-2 border-border/50 bg-muted/30">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-border/50">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Role Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-2 border-border/50 ${
                    role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted/30'
                  }`}
                >
                  {role === 'admin' ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline capitalize">{role}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-border/50">
                <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setRole('viewer')}>
                  <User className="w-4 h-4 mr-2" />
                  Viewer
                  <span className="ml-auto text-xs text-muted-foreground">Read only</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole('admin')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                  <span className="ml-auto text-xs text-muted-foreground">Full access</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = activeView === item.id
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  )
                })}
                
                <div className="pt-2 border-t border-border/50">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  >
                    <Download className="w-5 h-5" />
                    Export Data
                  </button>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
