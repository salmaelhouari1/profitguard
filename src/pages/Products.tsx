import React, { useState } from 'react'
import { cn, formatCurrency } from '../lib/utils'
import { SectionLabel, StatusBadge, Card } from '../components/ui'
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { Product } from '../types'
import { useAppSecurity } from '../context/SecurityContext'
import { api } from '../backend/api'
import { EmptyState } from '../components/EmptyState'

interface ProductsPageProps {
  onNavigate: (page: string) => void
}

export function ProductsPage({ onNavigate }: ProductsPageProps) {
  const { session, currentWorkspace, loadSampleWorkspace } = useAppSecurity()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'healthy' | 'low' | 'negative' | 'missing'>('all')
  const [isSampleLoading, setIsSampleLoading] = useState(false)

  const products = api.getProducts(session)

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.status === filter
    return matchSearch && matchFilter
  })

  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0)
  const totalProfit = products.reduce((s, p) => s + p.contributionProfit, 0)
  const avgMargin = products.length > 0 ? products.reduce((s, p) => s + p.margin, 0) / products.length : 0
  const atRiskRevenue = products.filter(p => p.status !== 'healthy').reduce((s, p) => s + p.revenue, 0)

  const handleLoadSample = () => {
    setIsSampleLoading(true)
    try { loadSampleWorkspace() }
    finally { setIsSampleLoading(false) }
  }

  return (
    <div className="flex-1 overflow-auto bg-oyster">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        <div>
          <SectionLabel>Profitability</SectionLabel>
          <h1 className="font-display text-2xl font-bold text-ink mt-1">Product Profitability</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Revenue, COGS, contribution profit and margin by SKU.
            {currentWorkspace?.isDemo && <span className="ml-2 text-sage font-mono font-bold">[SAMPLE DATA — READ-ONLY]</span>}
          </p>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="No Products Found"
            description="Connect your Shopify store to populate product SKUs and auto-calculate live margins. You can also load a sample workspace to explore the Products view."
            onConnectStore={() => onNavigate('integrations')}
            onLoadSampleData={handleLoadSample}
            isSampleLoading={isSampleLoading}
          />
        ) : (
          <>
            {/* Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {[
                { label: 'Total Revenue',    value: formatCurrency(totalRevenue) },
                { label: 'Total Profit',     value: formatCurrency(totalProfit)  },
                { label: 'Avg. Margin',      value: `${avgMargin.toFixed(1)}%`   },
                { label: 'Revenue at Risk',  value: formatCurrency(atRiskRevenue), warn: true },
              ].map((s, i) => (
                <Card key={i} className="p-4 flex flex-col justify-between">
                  <p className="text-[11px] font-mono text-ink-muted uppercase font-bold tracking-wider">{s.label}</p>
                  <p className={cn('text-2xl font-display font-extrabold mt-1.5', s.warn ? 'text-clay' : 'text-ink')}>{s.value}</p>
                </Card>
              ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink stroke-[2.5]" />
                <input
                  type="text"
                  placeholder="Search products or SKU…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search products"
                  className="h-9 pl-9 pr-3 w-64 rounded bg-white border border-border text-sm font-medium text-ink placeholder:text-ink-muted shadow-card focus:outline-none focus:ring-2 focus:ring-electric-lime/50 focus:border-border-strong transition-colors"
                />
              </div>
              <div className="flex border border-border rounded overflow-hidden text-xs shadow-card">
                {(['all', 'healthy', 'low', 'negative', 'missing'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    aria-pressed={filter === f}
                    className={cn(
                      'px-3.5 py-1.5 font-mono font-bold capitalize transition-colors',
                      filter === f
                        ? 'bg-deep-ink text-white'
                        : 'bg-white text-ink hover:bg-oyster-100'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]" role="table" aria-label="Products table">
                  <thead className="bg-[#EAE6DB] border-b-2 border-border-strong">
                    <tr>
                      {['Product', 'SKU', 'Revenue', 'COGS', 'Contribution Profit', 'Margin', 'Units', 'Trend', 'Status'].map(h => (
                        <th key={h} className="text-left text-[11px] font-mono tracking-wider text-ink font-bold uppercase px-4 py-3.5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    {filtered.map(p => {
                      const TrendIcon = p.trend === 'up' ? TrendingUp : p.trend === 'down' ? TrendingDown : Minus
                      const trendColor = p.trend === 'up' ? 'text-[#1B4A0E]' : p.trend === 'down' ? 'text-clay' : 'text-ink-muted'
                      return (
                        <tr key={p.id} className="hover:bg-oyster-100 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-bold text-ink">{p.name}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-[11px] font-mono font-semibold text-ink-secondary">{p.sku}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-mono font-bold text-ink">{formatCurrency(p.revenue)}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn('text-xs font-mono font-semibold', p.cogs === 0 ? 'text-sage italic' : 'text-ink-secondary')}>
                              {p.cogs === 0 ? 'Missing' : formatCurrency(p.cogs)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn(
                              'text-xs font-mono font-extrabold',
                              p.status === 'healthy' ? 'text-[#1B4A0E]'
                                : p.status === 'negative' ? 'text-clay'
                                : p.status === 'missing' ? 'text-sage'
                                : 'text-ink'
                            )}>
                              {p.status === 'missing' ? 'Estimated' : formatCurrency(p.contributionProfit)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-mono font-bold text-ink">
                              {p.status === 'missing' ? '—' : `${p.margin.toFixed(1)}%`}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-mono font-semibold text-ink-secondary">{p.unitsSold}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn('inline-flex items-center gap-1 text-xs font-mono font-bold', trendColor)}>
                              <TrendIcon size={13} className="stroke-[2.5]" />
                              {p.trendValue !== 0 ? `${Math.abs(p.trendValue).toFixed(1)}%` : '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={p.status} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && products.length > 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-ink-secondary">No products match your filter.</p>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
