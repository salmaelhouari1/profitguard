import React from 'react'
import { cn, formatCurrency } from '../lib/utils'
import { SectionLabel, Card } from '../components/ui'
import { AlertTriangle } from 'lucide-react'
import type { InventoryItem } from '../types'
import { useAppSecurity } from '../context/SecurityContext'
import { api } from '../backend/api'
import { EmptyState } from '../components/EmptyState'

interface InventoryPageProps {
  onNavigate: (page: string) => void
}

function StockStatus({ status }: { status: InventoryItem['status'] }) {
  const cfg = {
    'in-stock':     { label: 'In Stock',     className: 'bg-electric-lime-subtle text-electric-lime-text border-electric-lime/30' },
    'low-stock':    { label: 'Low Stock',    className: 'bg-clay-surface text-clay border-clay/30' },
    'out-of-stock': { label: 'Out of Stock', className: 'bg-clay text-white border-transparent' },
  }[status]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-mono font-medium border', cfg.className)}>
      {cfg.label}
    </span>
  )
}

export function InventoryPage({ onNavigate }: InventoryPageProps) {
  const { session, currentWorkspace, loadSampleWorkspace } = useAppSecurity()
  const inventoryItems = api.getInventoryItems(session)

  const lowStockItems = inventoryItems.filter(i => i.status !== 'in-stock')
  const totalValue = inventoryItems.reduce((s, i) => s + i.stockValue, 0)
  const totalUnits = inventoryItems.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="flex-1 overflow-auto bg-oyster">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div>
          <SectionLabel>Operations</SectionLabel>
          <h1 className="font-display text-2xl font-bold text-ink mt-1">Inventory</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Stock value, quantities, days of stock and low-stock alerts.
            {currentWorkspace?.isDemo && <span className="ml-2 text-sage font-mono font-bold">[SAMPLE DATA — READ-ONLY]</span>}
          </p>
        </div>

        {inventoryItems.length === 0 ? (
          <EmptyState
            title="No Inventory Data"
            description="No inventory records are available for this workspace. Connect your store or load sample data to track stock levels, reorder points and dead stock value."
            onConnectStore={() => onNavigate('integrations')}
            onLoadSampleData={() => loadSampleWorkspace()}
          />
        ) : (
          <>
            {/* Low-stock alerts */}
            {lowStockItems.length > 0 && (
              <div className="space-y-2">
                {lowStockItems.map(item => (
                  <div key={item.id} className={cn(
                    'flex items-start gap-3 p-3.5 rounded-lg border',
                    item.status === 'out-of-stock' ? 'bg-clay-surface border-clay/30' : 'bg-clay-50 border-clay/15'
                  )}>
                    <AlertTriangle size={14} className="text-clay mt-0.5 flex-shrink-0" aria-hidden />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-ink">{item.product}</p>
                      <p className="text-[11px] text-ink-secondary mt-0.5">
                        {item.status === 'out-of-stock'
                          ? 'Out of stock — no units available. Sales revenue at risk.'
                          : `Only ${item.daysOfStock} days of stock remaining at current sell-through.`
                        }
                      </p>
                    </div>
                    <StockStatus status={item.status} />
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Card className="p-4">
                <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider">Total Stock Value</p>
                <p className="text-2xl font-display font-bold text-ink mt-1">{formatCurrency(totalValue)}</p>
              </Card>
              <Card className="p-4">
                <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider">Total Units</p>
                <p className="text-2xl font-display font-bold text-ink mt-1">{totalUnits.toLocaleString()}</p>
              </Card>
              <Card className="p-4">
                <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider">Items Needing Attention</p>
                <p className="text-2xl font-display font-bold text-clay mt-1">{lowStockItems.length}</p>
              </Card>
            </div>

            {/* Table */}
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]" role="table" aria-label="Inventory table">
                  <thead className="bg-oyster border-b border-border">
                    <tr>
                      {['Product', 'SKU', 'Stock Value', 'Qty', 'Days of Stock', 'Reorder At', 'Status'].map(h => (
                        <th key={h} className="text-left text-[10px] font-mono tracking-wider text-ink-secondary uppercase px-4 py-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {inventoryItems.map(item => (
                      <tr key={item.id} className="hover:bg-oyster-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-ink">{item.product}</td>
                        <td className="px-4 py-3 text-[10px] font-mono text-ink-secondary">{item.sku}</td>
                        <td className="px-4 py-3 text-xs font-mono text-ink">{formatCurrency(item.stockValue)}</td>
                        <td className="px-4 py-3 text-xs font-mono text-ink">{item.quantity}</td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs font-mono', item.daysOfStock <= 7 ? 'text-clay font-semibold' : item.daysOfStock <= 14 ? 'text-amber-600' : 'text-ink')}>
                            {item.daysOfStock === 0 ? '0' : item.daysOfStock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-ink-secondary">{item.reorderPoint}</td>
                        <td className="px-4 py-3"><StockStatus status={item.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
