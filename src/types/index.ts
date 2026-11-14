// ─── Core Financial Types ──────────────────────────────────────────────────

export type MarginStatus = 'healthy' | 'low' | 'negative' | 'missing'
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'
export type OrderStatus = 'fulfilled' | 'pending' | 'refunded' | 'at_risk'

export interface FinancialSummary {
  contributionProfit: number
  revenue: number
  profitMargin: number
  orders: number
  avgOrderValue: number
  profitAtRisk: number
  advertisingSpend: number
  grossProfit: number
  dateRange: string
  comparisonPeriod: {
    revenue: number
    profitMargin: number
    contributionProfit: number
  }
}

export interface Order {
  id: string
  orderNumber: string
  product: string
  date: string
  revenue: number
  cogs: number
  shipping: number
  discount: number
  profit: number
  margin: number
  status: OrderStatus
  marginStatus: MarginStatus
}

export interface Product {
  id: string
  name: string
  sku: string
  revenue: number
  cogs: number
  contributionProfit: number
  margin: number
  unitsSold: number
  status: MarginStatus
  trend: 'up' | 'down' | 'stable'
  trendValue: number
}

export interface Expense {
  id: string
  category: string
  description: string
  amount: number
  date: string
  type: 'fixed' | 'variable' | 'one-time'
}

export interface ExpenseCategory {
  name: string
  total: number
  budget: number
  transactions: number
  change: number
}

export interface MarketingChannel {
  id: string
  name: string
  spend: number
  attributedRevenue: number
  roas: number
  breakEvenRoas: number
  contributionAfterAds: number
  status: 'profitable' | 'break-even' | 'unprofitable'
}

export interface InventoryItem {
  id: string
  product: string
  sku: string
  stockValue: number
  quantity: number
  reorderPoint: number
  daysOfStock: number
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}

export interface Risk {
  id: string
  title: string
  description: string
  level: RiskLevel
  impact: number
  evidence: string
  recommendation: string
  affectedOrders?: number
}

export interface Alert {
  id: string
  type: 'warning' | 'info' | 'success' | 'critical'
  title: string
  description: string
  action?: string
  timestamp: string
}

export interface TrendPoint {
  date: string
  revenue: number
  profit: number
  margin: number
}

export interface NavItem {
  label: string
  icon: string
  path: string
  badge?: number
}

export interface NavSection {
  section: string
  items: NavItem[]
}
