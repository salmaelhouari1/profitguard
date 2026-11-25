import React, { useState } from 'react'
import { SectionLabel, Card, Button } from '../components/ui'
import { TrendChart } from '../components/charts'
import { formatCurrency } from '../lib/utils'
import { Download, FileText, Check } from 'lucide-react'
import { useAppSecurity } from '../context/SecurityContext'
import { api } from '../backend/api'

interface ReportsPageProps {
  onNavigate: (page: string) => void
}

export function ReportsPage({ onNavigate }: ReportsPageProps) {
  const { session, currentWorkspace } = useAppSecurity()
  const [downloadedReport, setDownloadedReport] = useState<string | null>(null)

  const fs = api.getFinancialSummary(session)
  const orders = api.getOrders(session)
  const trendData = api.getTrendData(session)

  const handleExportCsv = (reportName: string) => {
    // Generate real CSV format from workspace orders
    let csvContent = 'data:text/csv;charset=utf-8,'
    csvContent += 'Order Number,Product,Date,Revenue,COGS,Shipping,Discount,Profit,Margin,Status\n'

    orders.forEach((o) => {
      csvContent += `${o.orderNumber},"${o.product}",${o.date},${o.revenue},${o.cogs},${o.shipping},${o.discount},${o.profit},${o.margin}%,${o.status}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${reportName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setDownloadedReport(reportName)
    setTimeout(() => setDownloadedReport(null), 3000)
  }

  const grossMargin = fs.revenue > 0 ? ((fs.grossProfit / fs.revenue) * 100).toFixed(1) : '0.0'

  return (
    <div className="flex-1 overflow-auto bg-oyster">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div>
          <SectionLabel>Intelligence</SectionLabel>
          <h1 className="font-display text-2xl font-bold text-ink mt-1">Financial Reports</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Export comprehensive P&L, product margins, and order records for workspace: <span className="font-mono font-bold text-ink">{currentWorkspace?.name}</span>.
          </p>
        </div>

        {/* Period P&L summary */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-ink">P&L Financial Summary</h2>
              <p className="text-xs text-ink-secondary mt-0.5">{fs.dateRange || 'Current Accounting Period'}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCsv('ProfitGuard_PL_Summary')}
              className="flex items-center gap-1.5"
            >
              {downloadedReport === 'ProfitGuard_PL_Summary' ? (
                <>
                  <Check size={12} className="text-sage" /> Downloaded
                </>
              ) : (
                <>
                  <Download size={12} /> Export CSV
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Revenue',               value: formatCurrency(fs.revenue) },
              { label: 'Gross Profit',           value: formatCurrency(fs.grossProfit) },
              { label: 'Gross Margin',           value: `${grossMargin}%` },
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExportCsv(r.title)}
                  className="flex items-center gap-1.5"
                >
                  {downloadedReport === r.title ? (
                    <>
                      <Check size={12} className="text-sage" /> Downloaded
                    </>
                  ) : (
                    <>
                      <Download size={12} /> Export CSV
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
