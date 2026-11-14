import React from 'react'
import { DemoBanner, SectionLabel, Card, Button } from '../components/ui'
import { TrendChart } from '../components/charts'
import { trendData, financialSummary } from '../data/demo'
import { formatCurrency } from '../lib/utils'
import { Download, FileText } from 'lucide-react'

interface ReportsPageProps {
  onNavigate: (page: string) => void
}

export function ReportsPage({ onNavigate }: ReportsPageProps) {
  const fs = financialSummary
  return (
    <div className="flex-1 overflow-auto bg-oyster">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div>
          <DemoBanner />
          <div className="mt-4">
            <SectionLabel>Intelligence</SectionLabel>
            <h1 className="font-display text-2xl font-bold text-ink mt-1">Reports</h1>
            <p className="text-sm text-ink-secondary mt-1">Financial reporting and export interface.</p>
          </div>
        </div>

        {/* Period P&L summary */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-ink">Monthly P&L Summary</h2>
              <p className="text-xs text-ink-secondary mt-0.5">{fs.dateRange}</p>
            </div>
            <Button variant="outline" size="sm">
              <Download size={12} /> Export CSV
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Revenue',               value: formatCurrency(fs.revenue) },
              { label: 'Gross Profit',           value: formatCurrency(fs.grossProfit) },
              { label: 'Gross Margin',           value: `${((fs.grossProfit / fs.revenue) * 100).toFixed(1)}%` },
              { label: 'Ad Spend',               value: formatCurrency(fs.advertisingSpend) },
              { label: 'Contribution Profit',    value: formatCurrency(fs.contributionProfit) },
              { label: 'Contribution Margin',    value: `${fs.profitMargin}%` },
            ].map((r, i) => (
              <div key={i} className="border-b border-border pb-3">
                <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider">{r.label}</p>
                <p className="text-lg font-display font-bold text-ink mt-1">{r.value}</p>
              </div>
            ))}
          </div>
          <TrendChart data={trendData} metric="profit" />
        </Card>

        {/* Available reports */}
        <div>
          <h2 className="text-sm font-semibold text-ink mb-3">Available Reports</h2>
          <div className="space-y-2">
            {[
              { title: 'Order Profitability Report',     desc: 'All orders with revenue, COGS, profit, margin and risk status.' },
              { title: 'Product Performance Report',    desc: 'SKU-level profitability with trend analysis.' },
              { title: 'Expense Summary Report',        desc: 'Category totals, budget variance and transaction history.' },
              { title: 'Marketing Efficiency Report',   desc: 'ROAS, break-even analysis and contribution after advertising.' },
              { title: 'Inventory Valuation Report',    desc: 'Stock value, days of stock and reorder recommendations.' },
            ].map((r, i) => (
              <Card key={i} className="flex items-center gap-4 p-4">
                <FileText size={16} className="text-sage flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-ink">{r.title}</p>
                  <p className="text-[11px] text-ink-secondary mt-0.5">{r.desc}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Download size={12} /> Export
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
