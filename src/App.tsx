import React, { useState } from 'react'
import { Sidebar, TopNav } from './components/layout/Sidebar'
import { AppSecurityProvider, useAppSecurity } from './context/SecurityContext'
import { OverviewPage } from './pages/Overview'
import { OrdersPage } from './pages/Orders'
import { ProductsPage } from './pages/Products'
import { ExpensesPage } from './pages/Expenses'
import { MarketingPage } from './pages/Marketing'
import { InventoryPage } from './pages/Inventory'
import { RisksPage } from './pages/Risks'
import { ReportsPage } from './pages/Reports'
import { AIAnalystPage } from './pages/AIAnalyst'
import { IntegrationsPage } from './pages/Integrations'
import { SettingsPage } from './pages/Settings'
import { AnalyticsPage } from './pages/Analytics'

type Page =
  | 'overview' | 'analytics'
  | 'orders' | 'products' | 'expenses'
  | 'marketing' | 'inventory'
  | 'risks' | 'reports' | 'ai-analyst'
  | 'integrations' | 'settings'

const pageConfig: Record<Page, { title: string; subtitle: string }> = {
  'overview':      { title: 'Overview',         subtitle: 'Clarity behind every profit' },
  'analytics':     { title: 'Analytics',         subtitle: 'Trends & performance' },
  'orders':        { title: 'Orders',            subtitle: 'Profit detection' },
  'products':      { title: 'Products',          subtitle: 'Profit detection' },
  'expenses':      { title: 'Expenses',          subtitle: 'Cost management' },
  'marketing':     { title: 'Marketing',         subtitle: 'Efficiency & ROAS' },
  'inventory':     { title: 'Inventory',         subtitle: 'Stock management' },
  'risks':         { title: 'Risks & Alerts',    subtitle: 'Financial intelligence' },
  'reports':       { title: 'Reports',           subtitle: 'Financial reporting' },
  'ai-analyst':    { title: 'AI Analyst',        subtitle: 'Profit explanation' },
  'integrations':  { title: 'Integrations',      subtitle: 'Store connections' },
  'settings':      { title: 'Settings',          subtitle: 'Merchant control' },
}

function MainLayout() {
  const [currentPage, setCurrentPage] = useState<Page>('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { currentWorkspace } = useAppSecurity()

  const navigate = (page: string) => setCurrentPage(page as Page)
  const cfg = pageConfig[currentPage]

  const renderPage = () => {
    const props = { onNavigate: navigate }
    switch (currentPage) {
      case 'overview':     return <OverviewPage {...props} />
      case 'analytics':    return <AnalyticsPage {...props} />
      case 'orders':       return <OrdersPage {...props} />
      case 'products':     return <ProductsPage {...props} />
      case 'expenses':     return <ExpensesPage {...props} />
      case 'marketing':    return <MarketingPage {...props} />
      case 'inventory':    return <InventoryPage {...props} />
      case 'risks':        return <RisksPage {...props} />
      case 'reports':      return <ReportsPage {...props} />
      case 'ai-analyst':   return <AIAnalystPage {...props} />
      case 'integrations': return <IntegrationsPage {...props} />
      case 'settings':     return <SettingsPage {...props} />
      default:             return <OverviewPage {...props} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-oyster">
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav
          title={cfg.title}
          subtitle={currentWorkspace?.isDemo ? `${cfg.subtitle} (Demo Workspace: ${currentWorkspace.name})` : cfg.subtitle}
          onMenuToggle={() => setMobileOpen(true)}
        />
        {renderPage()}
      </div>
    </div>
  )
}

function App() {
  return (
    <AppSecurityProvider>
      <MainLayout />
    </AppSecurityProvider>
  )
}

export default App
