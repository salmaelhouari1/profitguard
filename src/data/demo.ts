import type {
  FinancialSummary, Order, Product, Expense, ExpenseCategory,
  MarketingChannel, InventoryItem, Risk, Alert, TrendPoint
} from '../types'

// ─── Financial Summary (Demo) ──────────────────────────────────────────────
export const financialSummary: FinancialSummary = {
  contributionProfit: 18_420,
  revenue: 84_750,
  profitMargin: 21.7,
  orders: 312,
  avgOrderValue: 271.6,
  profitAtRisk: 4_890,
  advertisingSpend: 9_200,
  grossProfit: 31_560,
  dateRange: 'Oct 1 – Oct 31, 2026',
  comparisonPeriod: {
    revenue: 79_320,
    profitMargin: 19.4,
    contributionProfit: 15_380,
  }
}

// ─── Trend Data (30 days) ──────────────────────────────────────────────────
export const trendData: TrendPoint[] = [
  { date: 'Oct 1',  revenue: 2100, profit: 440,  margin: 21.0 },
  { date: 'Oct 3',  revenue: 2850, profit: 580,  margin: 20.4 },
  { date: 'Oct 5',  revenue: 1980, profit: 350,  margin: 17.7 },
  { date: 'Oct 7',  revenue: 3200, profit: 740,  margin: 23.1 },
  { date: 'Oct 9',  revenue: 2600, profit: 530,  margin: 20.4 },
  { date: 'Oct 11', revenue: 3800, profit: 920,  margin: 24.2 },
  { date: 'Oct 13', revenue: 2200, profit: 410,  margin: 18.6 },
  { date: 'Oct 15', revenue: 4100, profit: 980,  margin: 23.9 },
  { date: 'Oct 17', revenue: 2750, profit: 540,  margin: 19.6 },
  { date: 'Oct 19', revenue: 3300, profit: 700,  margin: 21.2 },
  { date: 'Oct 21', revenue: 2900, profit: 590,  margin: 20.3 },
  { date: 'Oct 23', revenue: 4600, profit: 1050, margin: 22.8 },
  { date: 'Oct 25', revenue: 3100, profit: 650,  margin: 21.0 },
  { date: 'Oct 27', revenue: 3850, profit: 870,  margin: 22.6 },
  { date: 'Oct 29', revenue: 2800, profit: 520,  margin: 18.6 },
  { date: 'Oct 31', revenue: 4700, profit: 1050, margin: 22.3 },
]

// ─── Orders (Demo) ─────────────────────────────────────────────────────────
export const orders: Order[] = [
  { id: '1', orderNumber: '#10492', product: 'Ceramic Pour-Over Set',    date: 'Oct 31, 2026', revenue: 68,  cogs: 22, shipping: 18, discount: 12, profit: 14,  margin: 20.6, status: 'fulfilled', marginStatus: 'low' },
  { id: '2', orderNumber: '#10491', product: 'Linen Table Runner',       date: 'Oct 31, 2026', revenue: 82,  cogs: 18, shipping: 8,  discount: 0,  profit: 46,  margin: 56.1, status: 'fulfilled', marginStatus: 'healthy' },
  { id: '3', orderNumber: '#10490', product: 'Stoneware Dinnerware Set', date: 'Oct 30, 2026', revenue: 142, cogs: 58, shipping: 22, discount: 28, profit: 8,   margin: 5.6,  status: 'at_risk',   marginStatus: 'negative' },
  { id: '4', orderNumber: '#10489', product: 'Oak Serving Board',        date: 'Oct 30, 2026', revenue: 54,  cogs: 14, shipping: 7,  discount: 0,  profit: 26,  margin: 48.1, status: 'fulfilled', marginStatus: 'healthy' },
  { id: '5', orderNumber: '#10488', product: 'Espresso Grinder Pro',     date: 'Oct 29, 2026', revenue: 124, cogs: 0,  shipping: 12, discount: 5,  profit: 0,   margin: 0,    status: 'pending',   marginStatus: 'missing' },
  { id: '6', orderNumber: '#10487', product: 'Handwoven Basket Set',     date: 'Oct 29, 2026', revenue: 94,  cogs: 31, shipping: 11, discount: 8,  profit: 38,  margin: 40.4, status: 'fulfilled', marginStatus: 'healthy' },
  { id: '7', orderNumber: '#10486', product: 'Marble Cheese Board',      date: 'Oct 28, 2026', revenue: 76,  cogs: 24, shipping: 14, discount: 0,  profit: 32,  margin: 42.1, status: 'fulfilled', marginStatus: 'healthy' },
  { id: '8', orderNumber: '#10485', product: 'Copper Moscow Mule Set',   date: 'Oct 28, 2026', revenue: 112, cogs: 44, shipping: 19, discount: 22, profit: 11,  margin: 9.8,  status: 'at_risk',   marginStatus: 'low' },
  { id: '9', orderNumber: '#10484', product: 'Bamboo Cutting Board',     date: 'Oct 27, 2026', revenue: 44,  cogs: 11, shipping: 6,  discount: 0,  profit: 22,  margin: 50.0, status: 'fulfilled', marginStatus: 'healthy' },
  { id: '10',orderNumber: '#10483', product: 'Cast Iron Dutch Oven',     date: 'Oct 27, 2026', revenue: 189, cogs: 72, shipping: 24, discount: 15, profit: 64,  margin: 33.9, status: 'fulfilled', marginStatus: 'healthy' },
]

// ─── Products (Demo) ───────────────────────────────────────────────────────
export const products: Product[] = [
  { id: '1', name: 'Cast Iron Dutch Oven',     sku: 'CI-DUTCH-001', revenue: 9_828,  cogs: 3_744, contributionProfit: 3_328, margin: 33.9, unitsSold: 52,  status: 'healthy',  trend: 'up',   trendValue: 12.4 },
  { id: '2', name: 'Handwoven Basket Set',     sku: 'HW-BSKT-003', revenue: 7_144,  cogs: 2_356, contributionProfit: 2_890, margin: 40.4, unitsSold: 76,  status: 'healthy',  trend: 'up',   trendValue: 8.1 },
  { id: '3', name: 'Linen Table Runner',       sku: 'LN-TBLR-002', revenue: 6_232,  cogs: 1_368, contributionProfit: 3_496, margin: 56.1, unitsSold: 76,  status: 'healthy',  trend: 'stable',trendValue: 0.3 },
  { id: '4', name: 'Marble Cheese Board',      sku: 'MB-CHSE-004', revenue: 5_776,  cogs: 1_824, contributionProfit: 2_432, margin: 42.1, unitsSold: 76,  status: 'healthy',  trend: 'up',   trendValue: 4.2 },
  { id: '5', name: 'Ceramic Pour-Over Set',    sku: 'CR-POUR-005', revenue: 5_168,  cogs: 1_672, contributionProfit: 1_064, margin: 20.6, unitsSold: 76,  status: 'low',      trend: 'down', trendValue: -6.8 },
  { id: '6', name: 'Oak Serving Board',        sku: 'OAK-SRV-006', revenue: 4_104,  cogs: 1_064, contributionProfit: 1_976, margin: 48.1, unitsSold: 76,  status: 'healthy',  trend: 'up',   trendValue: 2.1 },
  { id: '7', name: 'Copper Moscow Mule Set',   sku: 'CU-MULE-007', revenue: 8_512,  cogs: 3_344, contributionProfit: 836,   margin: 9.8,  unitsSold: 76,  status: 'low',      trend: 'down', trendValue: -11.2 },
  { id: '8', name: 'Espresso Grinder Pro',     sku: 'ES-GRND-008', revenue: 9_424,  cogs: 0,     contributionProfit: 0,     margin: 0,    unitsSold: 76,  status: 'missing',  trend: 'down', trendValue: 0 },
  { id: '9', name: 'Stoneware Dinnerware Set', sku: 'SW-DNNR-009', revenue: 10_792, cogs: 4_408, contributionProfit: 608,   margin: 5.6,  unitsSold: 76,  status: 'negative', trend: 'down', trendValue: -18.4 },
  { id: '10',name: 'Bamboo Cutting Board',     sku: 'BB-CUTT-010', revenue: 3_344,  cogs: 836,   contributionProfit: 1_672, margin: 50.0, unitsSold: 76,  status: 'healthy',  trend: 'stable',trendValue: 1.1 },
]

// ─── Expense Categories (Demo) ─────────────────────────────────────────────
export const expenseCategories: ExpenseCategory[] = [
  { name: 'Advertising',       total: 9_200,  budget: 10_000, transactions: 24,  change: 8.4 },
  { name: 'Shipping & Fulfillment', total: 6_480, budget: 7_000, transactions: 312, change: -2.1 },
  { name: 'Platform & Tools',  total: 1_240,  budget: 1_500,  transactions: 8,   change: 0 },
  { name: 'Salaries',          total: 8_500,  budget: 8_500,  transactions: 2,   change: 0 },
  { name: 'Returns & Refunds', total: 1_890,  budget: 2_000,  transactions: 18,  change: -14.3 },
  { name: 'Packaging',         total: 2_100,  budget: 2_500,  transactions: 6,   change: 5.2 },
]

export const expenses: Expense[] = [
  { id: '1',  category: 'Advertising', description: 'Google Ads — October',       amount: 4_800, date: 'Oct 31, 2026', type: 'variable' },
  { id: '2',  category: 'Advertising', description: 'Meta Ads — October',         amount: 3_200, date: 'Oct 31, 2026', type: 'variable' },
  { id: '3',  category: 'Advertising', description: 'TikTok Ads — October',       amount: 1_200, date: 'Oct 31, 2026', type: 'variable' },
  { id: '4',  category: 'Shipping & Fulfillment', description: 'ShipStation fees', amount: 480,  date: 'Oct 31, 2026', type: 'fixed' },
  { id: '5',  category: 'Platform & Tools', description: 'Shopify subscription',  amount: 79,   date: 'Oct 1,  2026', type: 'fixed' },
  { id: '6',  category: 'Salaries',    description: 'Operations team — Oct',      amount: 8_500, date: 'Oct 31, 2026', type: 'fixed' },
  { id: '7',  category: 'Packaging',   description: 'Custom boxes & tissue',      amount: 2_100, date: 'Oct 15, 2026', type: 'variable' },
]

// ─── Marketing Channels (Demo) ─────────────────────────────────────────────
export const marketingChannels: MarketingChannel[] = [
  { id: '1', name: 'Google Shopping',  spend: 4_800, attributedRevenue: 24_600, roas: 5.1, breakEvenRoas: 3.2, contributionAfterAds: 8_200,  status: 'profitable' },
  { id: '2', name: 'Meta Ads',         spend: 3_200, attributedRevenue: 11_200, roas: 3.5, breakEvenRoas: 3.2, contributionAfterAds: 960,    status: 'profitable' },
  { id: '3', name: 'TikTok Ads',       spend: 1_200, attributedRevenue: 2_880,  roas: 2.4, breakEvenRoas: 3.2, contributionAfterAds: -576,   status: 'unprofitable' },
  { id: '4', name: 'Email Marketing',  spend: 0,     attributedRevenue: 8_900,  roas: 0,   breakEvenRoas: 3.2, contributionAfterAds: 8_900,  status: 'profitable' },
]

// ─── Inventory (Demo) ──────────────────────────────────────────────────────
export const inventoryItems: InventoryItem[] = [
  { id: '1',  product: 'Cast Iron Dutch Oven',     sku: 'CI-DUTCH-001', stockValue: 7_488, quantity: 104, reorderPoint: 20, daysOfStock: 30, status: 'in-stock' },
  { id: '2',  product: 'Handwoven Basket Set',     sku: 'HW-BSKT-003', stockValue: 2_480, quantity: 80,  reorderPoint: 25, daysOfStock: 16, status: 'in-stock' },
  { id: '3',  product: 'Linen Table Runner',       sku: 'LN-TBLR-002', stockValue: 1_800, quantity: 72,  reorderPoint: 30, daysOfStock: 14, status: 'low-stock' },
  { id: '4',  product: 'Marble Cheese Board',      sku: 'MB-CHSE-004', stockValue: 2_400, quantity: 60,  reorderPoint: 20, daysOfStock: 12, status: 'low-stock' },
  { id: '5',  product: 'Ceramic Pour-Over Set',    sku: 'CR-POUR-005', stockValue: 1_320, quantity: 60,  reorderPoint: 20, daysOfStock: 24, status: 'in-stock' },
  { id: '6',  product: 'Stoneware Dinnerware Set', sku: 'SW-DNNR-009', stockValue: 2_904, quantity: 36,  reorderPoint: 15, daysOfStock: 7,  status: 'low-stock' },
  { id: '7',  product: 'Espresso Grinder Pro',     sku: 'ES-GRND-008', stockValue: 0,     quantity: 0,   reorderPoint: 10, daysOfStock: 0,  status: 'out-of-stock' },
  { id: '8',  product: 'Copper Moscow Mule Set',   sku: 'CU-MULE-007', stockValue: 3_520, quantity: 88,  reorderPoint: 15, daysOfStock: 35, status: 'in-stock' },
]

// ─── Risks (Demo) ──────────────────────────────────────────────────────────
export const risks: Risk[] = [
  {
    id: '1', title: 'High discount pressure on Stoneware Dinnerware',
    description: 'Average discount of 19.7% is compressing margins to near-zero territory.',
    level: 'critical', impact: 2_840,
    evidence: '8 orders this month with discounts above \$20. Net margin is 5.6%.',
    recommendation: 'Review discount rules. Consider minimum margin guardrails before applying discounts.',
    affectedOrders: 8
  },
  {
    id: '2', title: 'TikTok Ads returning below break-even ROAS',
    description: 'TikTok campaigns generating \$2.4 ROAS against a 3.2× break-even threshold.',
    level: 'high', impact: 576,
    evidence: 'Month-to-date: \$1,200 spend / \$2,880 attributed revenue. Contribution after ads: -\$576.',
    recommendation: 'Pause TikTok campaigns or restructure creative mix. Reallocate budget to Google Shopping.',
  },
  {
    id: '3', title: 'Missing COGS on Espresso Grinder Pro',
    description: 'No cost-of-goods data for this SKU. Profit figures are entirely estimated.',
    level: 'high', impact: 9_424,
    evidence: 'SKU ES-GRND-008 has 0 COGS recorded across 76 units sold totalling \$9,424 revenue.',
    recommendation: 'Enter supplier invoice cost in Settings → Products. This affects 11.1% of monthly revenue.',
    affectedOrders: 76
  },
  {
    id: '4', title: 'Ceramic Pour-Over Set margin declining',
    description: 'Product margin dropped 6.8 points vs. prior period — shipping cost rising.',
    level: 'medium', impact: 1_064,
    evidence: 'Shipping per order increased from \$12 to \$18 avg. Current margin: 20.6%.',
    recommendation: 'Negotiate carrier rates or adjust pricing. Free shipping threshold may need revision.',
  },
  {
    id: '5', title: 'Linen Table Runner approaching low stock',
    description: 'Only 14 days of stock remaining at current sell-through rate.',
    level: 'medium', impact: 0,
    evidence: '72 units on hand, selling ~5 units/day. Reorder point: 30 units.',
    recommendation: 'Issue purchase order immediately. Lead time must be under 14 days to avoid stockout.',
  },
]

// ─── Alerts (Demo) ─────────────────────────────────────────────────────────
export const alerts: Alert[] = [
  {
    id: '1', type: 'critical', timestamp: '2026-10-31',
    title: 'Stoneware Dinnerware margin below 10%',
    description: '8 recent orders with heavy discounting. Combined profit at risk: \$2,840.',
    action: 'Review orders'
  },
  {
    id: '2', type: 'warning', timestamp: '2026-10-30',
    title: 'TikTok Ads below break-even ROAS (2.4× vs 3.2×)',
    description: 'Campaign spend is not generating sufficient contribution profit.',
    action: 'Review marketing'
  },
  {
    id: '3', type: 'info', timestamp: '2026-10-29',
    title: 'Revenue up 6.8% vs. prior period',
    description: 'Google Shopping driving the majority of growth. Meta performance stable.',
  },
  {
    id: '4', type: 'success', timestamp: '2026-10-28',
    title: 'Profit margin improved to 21.7%',
    description: 'Exceeds target of 20%. Returns & refunds down 14.3% month-over-month.',
  },
]
