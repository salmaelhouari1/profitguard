import React, { useState } from 'react'
import { cn, formatCurrency } from '../lib/utils'
import { orders } from '../data/demo'
import { DemoBanner, SectionLabel, StatusBadge, Card, Input } from '../components/ui'
import { Search, ArrowUpDown } from 'lucide-react'
import type { Order } from '../types'

interface OrdersPageProps {
  onNavigate: (page: string) => void
}

type SortKey = keyof Pick<Order, 'revenue' | 'profit' | 'margin' | 'date'>
type SortDir = 'asc' | 'desc'

export function OrdersPage({ onNavigate }: OrdersPageProps) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = orders
    .filter(o =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase()) ||
      o.marginStatus.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey] as string | number
      const bv = b[sortKey] as string | number
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })

  const Col = ({ label, sortable, sk }: { label: string; sortable?: boolean; sk?: SortKey }) => (
    <th
      className={cn(
        'text-left text-[11px] font-mono tracking-wider text-ink font-bold uppercase px-4 py-3.5 select-none',
        sortable && 'cursor-pointer hover:text-deep-ink'
      )}
      onClick={() => sortable && sk && handleSort(sk)}
    >
      <span className="inline-flex items-center gap-1.5">
        {label}
        {sortable && sk === sortKey && (
          <span className="text-sage font-extrabold">{sortDir === 'asc' ? '▲' : '▼'}</span>
        )}
      </span>
    </th>
  )

  return (
    <div className="flex-1 overflow-auto bg-oyster">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        <div>
          <DemoBanner />
          <div className="mt-4">
            <SectionLabel>Profitability</SectionLabel>
            <h1 className="font-display text-2xl font-bold text-ink mt-1">Orders</h1>
            <p className="text-sm text-ink-secondary mt-1">
              Financial breakdown of every order. Search, sort and identify margin pressure.
            </p>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { label: 'Total orders',    value: orders.length.toString(),                                                  extra: 'in current period' },
            { label: 'At risk',         value: orders.filter(o => o.marginStatus !== 'healthy').length.toString(),       extra: 'review needed',    warn: true },
            { label: 'Avg. margin',     value: `${(orders.reduce((s, o) => s + o.margin, 0) / orders.length).toFixed(1)}%`, extra: 'across all units' },
            { label: 'Missing COGS',    value: orders.filter(o => o.marginStatus === 'missing').length.toString(),        extra: 'incomplete data',  warn: true },
          ].map((s, i) => (
            <Card key={i} className="p-4 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-mono text-ink-muted uppercase font-bold tracking-wider">{s.label}</p>
                <p className={cn('text-2xl font-display font-extrabold mt-1.5', s.warn ? 'text-clay' : 'text-ink')}>{s.value}</p>
              </div>
              {s.extra && <p className="text-xs font-medium text-ink-secondary mt-1">{s.extra}</p>}
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
          <input
            type="text"
            placeholder="Search orders, products, or status…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm h-9 pl-9 pr-3 rounded bg-white border border-border text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-electric-lime/50 focus:border-electric-lime/70 transition-colors"
          />
        </div>

        {/* Table */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-[#EAE6DB] border-b-2 border-border-strong">
                <tr>
                  <Col label="Order" />
                  <Col label="Product" />
                  <Col label="Date" sortable sk="date" />
                  <Col label="Revenue" sortable sk="revenue" />
                  <Col label="Shipping" />
                  <Col label="Discount" />
                  <Col label="Profit" sortable sk="profit" />
                  <Col label="Margin" sortable sk="margin" />
                  <Col label="Status" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-oyster-100 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-ink">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-bold text-ink max-w-[170px] block truncate">{order.product}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono font-medium text-ink-secondary whitespace-nowrap">{order.date}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono font-bold text-ink">{formatCurrency(order.revenue)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono font-semibold text-ink-secondary">{formatCurrency(order.shipping)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn('text-xs font-mono font-bold', order.discount > 0 ? 'text-clay' : 'text-ink-muted')}>
                        {order.discount > 0 ? `-${formatCurrency(order.discount)}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        'text-xs font-mono font-extrabold',
                        order.marginStatus === 'healthy' ? 'text-[#1B4A0E]'
                          : order.marginStatus === 'negative' ? 'text-clay'
                          : order.marginStatus === 'missing' ? 'text-sage'
                          : 'text-ink'
                      )}>
                        {order.marginStatus === 'missing' ? 'Estimated' : formatCurrency(order.profit)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        'text-xs font-mono font-bold',
                        order.marginStatus === 'missing' ? 'text-ink-muted italic' : 'text-ink'
                      )}>
                        {order.marginStatus === 'missing' ? 'Incomplete' : `${order.margin.toFixed(1)}%`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={order.marginStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-ink-secondary">No orders match your search.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
