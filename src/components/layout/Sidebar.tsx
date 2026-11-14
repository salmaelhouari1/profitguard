import React, { useState } from 'react'
import { cn } from '../../lib/utils'
import {
  LayoutDashboard, ShoppingCart, Package, Receipt,
  Megaphone, Boxes, AlertTriangle, FileText,
  BrainCircuit, Plug, Settings, ChevronRight,
  Shield, TrendingUp, Menu, X
} from 'lucide-react'

// ─── Nav structure ─────────────────────────────────────────────────────────
const navSections = [
  {
    section: 'WORKSPACE',
    items: [
      { label: 'Overview',     icon: LayoutDashboard, path: 'overview' },
      { label: 'Analytics',    icon: TrendingUp,       path: 'analytics' },
    ]
  },
  {
    section: 'PROFITABILITY',
    items: [
      { label: 'Orders',    icon: ShoppingCart, path: 'orders',   badge: 3 },
      { label: 'Products',  icon: Package,      path: 'products' },
      { label: 'Expenses',  icon: Receipt,      path: 'expenses' },
    ]
  },
  {
    section: 'OPERATIONS',
    items: [
      { label: 'Marketing',  icon: Megaphone, path: 'marketing' },
      { label: 'Inventory',  icon: Boxes,     path: 'inventory', badge: 2 },
    ]
  },
  {
    section: 'INTELLIGENCE',
    items: [
      { label: 'Risks & Alerts', icon: AlertTriangle, path: 'risks',      badge: 2 },
      { label: 'Reports',        icon: FileText,       path: 'reports' },
      { label: 'AI Analyst',     icon: BrainCircuit,   path: 'ai-analyst' },
    ]
  },
  {
    section: 'ADMINISTRATION',
    items: [
      { label: 'Integrations', icon: Plug,      path: 'integrations' },
      { label: 'Settings',     icon: Settings,  path: 'settings' },
    ]
  },
]

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ currentPage, onNavigate, mobileOpen, onMobileClose }: SidebarProps) {
  const handleNav = (path: string) => {
    onNavigate(path)
    onMobileClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-deep-ink/60 z-30 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar panel */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-56 bg-deep-ink flex flex-col z-40',
        'transform transition-transform duration-200 ease-in-out',
        'md:relative md:translate-x-0 md:flex-shrink-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-5 border-b border-deep-ink-border">
          <div className="w-8 h-8 rounded-md bg-electric-lime flex items-center justify-center flex-shrink-0 shadow-sm">
            <Shield size={16} className="text-electric-lime-text stroke-[2.5]" />
          </div>
          <div>
            <p className="text-sm font-bold font-display text-white tracking-wide leading-none">ProfitGuard</p>
            <p className="text-[10px] font-mono tracking-widest text-[#9EC2B4] font-semibold mt-1 uppercase">Financial Intelligence</p>
          </div>
          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="ml-auto text-[#9EC2B4] hover:text-white md:hidden transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navSections.map((section) => (
            <div key={section.section}>
              <p className="text-[10px] font-mono tracking-widest text-[#9EC2B4] uppercase px-2.5 mb-2.5 font-bold select-none">
                {section.section}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPage === item.path
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => handleNav(item.path)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors duration-150 group text-left',
                          isActive
                            ? 'bg-deep-ink-light text-white font-semibold shadow-sm'
                            : 'text-[#D0E2DC] hover:text-white hover:bg-deep-ink-light font-medium'
                        )}
                      >
                        <Icon
                          size={15}
                          className={cn(
                            'flex-shrink-0 transition-colors',
                            isActive ? 'text-electric-lime stroke-[2.5]' : 'text-[#8DB4A6] group-hover:text-electric-lime stroke-[2]'
                          )}
                        />
                        <span className="flex-1 font-sans text-[13px]">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono font-bold bg-[#E07954]/25 text-[#FF9E7A] rounded px-1.5 py-0.5 leading-none">
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <ChevronRight size={13} className="text-electric-lime flex-shrink-0 stroke-[2.5]" />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Demo mode indicator */}
        <div className="mx-3 mb-4 p-3 rounded-md bg-deep-ink-surface border border-deep-ink-border">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-electric-lime animate-pulse" />
            <p className="text-[11px] font-mono font-bold tracking-wider text-electric-lime uppercase">Demo Mode</p>
          </div>
          <p className="text-[11px] text-[#A6C9BC] leading-relaxed">
            Connect Shopify to replace demo data with live store data.
          </p>
        </div>
      </aside>
    </>
  )
}

// ─── Top Navigation Bar ────────────────────────────────────────────────────
interface TopNavProps {
  title: string
  subtitle?: string
  onMenuToggle: () => void
  actions?: React.ReactNode
}

export function TopNav({ title, subtitle, onMenuToggle, actions }: TopNavProps) {
  return (
    <header className="h-14 bg-white border-b border-border shadow-card flex items-center px-5 gap-4 flex-shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="md:hidden text-ink hover:text-deep-ink transition-colors"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-ink truncate">{title}</span>
          {subtitle && (
            <>
              <span className="text-border-strong font-bold">·</span>
              <span className="text-sm font-medium text-ink-secondary truncate hidden sm:block">{subtitle}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}
        {/* Integration status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-oyster-100 border border-border text-xs font-mono font-medium text-ink">
          <span className="w-2 h-2 rounded-full bg-clay" />
          Shopify not connected
        </div>
      </div>
    </header>
  )
}
