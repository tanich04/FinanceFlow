'use client'

import { useState, useEffect } from 'react'
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
  Sun,
  Moon,
  RefreshCw,
  Sparkles,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useFinanceStore, type UserRole } from '@/lib/store'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview of your finances' },
  { id: 'transactions', label: 'Transactions', icon: Receipt, description: 'Manage all transactions' },
  { id: 'insights', label: 'Insights', icon: Lightbulb, description: 'Financial analytics & tips' },
] as const

export default function Header() {
  const activeView = useFinanceStore((state) => state.activeView)
  const setActiveView = useFinanceStore((state) => state.setActiveView)
  const role = useFinanceStore((state) => state.role)
  const setRole = useFinanceStore((state) => state.setRole)
  const transactions = useFinanceStore((state) => state.transactions)
  const theme = useFinanceStore((state) => state.theme)
  const toggleTheme = useFinanceStore((state) => state.toggleTheme)
  const setTheme = useFinanceStore((state) => state.setTheme)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Sync theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true)
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 500))
    
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
    
    setIsExporting(false)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <header className="sticky top-0 z-40 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:block">
                FinanceFlow
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = activeView === item.id
                const Icon = item.icon
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={() => setActiveView(item.id)}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
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
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="glass-card">
                      <p>{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Refresh Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    className="hidden sm:flex"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh data</TooltipContent>
              </Tooltip>

              {/* Theme Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={toggleTheme}
                    className="relative p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {theme === 'dark' ? (
                        <motion.div
                          key="moon"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Moon className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="sun"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Sun className="w-4 h-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  Switch to {theme === 'dark' ? 'light' : 'dark'} mode
                </TooltipContent>
              </Tooltip>

              {/* Export Button - Primary CTA */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        className="hidden sm:flex gap-2 btn-secondary-cta"
                        disabled={isExporting}
                      >
                        <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                        {isExporting ? 'Exporting...' : 'Export'}
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Download your transaction data</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="glass-card border-border/50">
                  <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="w-8 h-6 bg-green-500/20 text-green-500 text-xs font-bold rounded flex items-center justify-center">CSV</span>
                      Export as CSV
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')} className="cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="w-8 h-6 bg-blue-500/20 text-blue-500 text-xs font-bold rounded flex items-center justify-center">JSON</span>
                      Export as JSON
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Role Switcher */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`gap-2 border-border/50 transition-all duration-300 ${
                            role === 'admin' 
                              ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30' 
                              : 'bg-muted/30'
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
                      </motion.div>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Switch user role</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="glass-card border-border/50 w-56">
                  <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setRole('viewer')}
                    className={`cursor-pointer ${role === 'viewer' ? 'bg-muted' : ''}`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    <div className="flex-1">
                      <p className="font-medium">Viewer</p>
                      <p className="text-xs text-muted-foreground">Read-only access</p>
                    </div>
                    {role === 'viewer' && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setRole('admin')}
                    className={`cursor-pointer ${role === 'admin' ? 'bg-muted' : ''}`}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    <div className="flex-1">
                      <p className="font-medium">Admin</p>
                      <p className="text-xs text-muted-foreground">Full CRUD access</p>
                    </div>
                    {role === 'admin' && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
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
                <AnimatePresence mode="wait" initial={false}>
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
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
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="md:hidden overflow-hidden"
              >
                <div className="py-4 space-y-1">
                  {navItems.map((item, index) => {
                    const isActive = activeView === item.id
                    const Icon = item.icon
                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                          setActiveView(item.id)
                          setMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <div className="flex-1 text-left">
                          <p>{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </motion.button>
                    )
                  })}
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pt-2 border-t border-border/50"
                  >
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Export Data
                    </button>
                  </motion.div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>
    </TooltipProvider>
  )
}
