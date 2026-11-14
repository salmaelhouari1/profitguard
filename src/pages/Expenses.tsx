import React from 'react'
import { cn, formatCurrency } from '../lib/utils'
import { expenseCategories, expenses } from '../data/demo'
import { DemoBanner, SectionLabel, Card } from '../components/ui'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface ExpensesPageProps {
  onNavigate: (page: string) => void
}

export function ExpensesPage({ onNavigate }: ExpensesPageProps) {
  const totalExpenses = expenseCategories.reduce((s, c) => s + c.total, 0)
  const totalBudget = expenseCategories.reduce((s, c) => s + c.budget, 0)

  return (
    <div className="flex-1 overflow-auto bg-oyster">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div>
          <DemoBanner />
          <div className="mt-4">
            <SectionLabel>Profitability</SectionLabel>
            <h1 className="font-display text-2xl font-bold text-ink mt-1">Expenses</h1>
            <p className="text-sm text-ink-secondary mt-1">Category totals, budget tracking and transaction records.</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="p-4">
            <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider">Total Expenses</p>
            <p className="text-2xl font-display font-bold text-ink mt-1">{formatCurrency(totalExpenses)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider">Total Budget</p>
            <p className="text-2xl font-display font-bold text-ink mt-1">{formatCurrency(totalBudget)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider">Budget Used</p>
            <p className={cn('text-2xl font-display font-bold mt-1', totalExpenses > totalBudget ? 'text-clay' : 'text-electric-lime-text')}>
              {((totalExpenses / totalBudget) * 100).toFixed(0)}%
            </p>
          </Card>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-sm font-semibold text-ink mb-3">Expense Categories</h2>
          <div className="space-y-2">
            {expenseCategories.map((cat, i) => {
              const pct = (cat.total / cat.budget) * 100
              const overBudget = cat.total > cat.budget
              return (
                <Card key={i} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{cat.name}</p>
                      <p className="text-[10px] font-mono text-ink-secondary mt-0.5">{cat.transactions} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-display font-bold text-ink">{formatCurrency(cat.total)}</p>
                      <p className="text-[10px] font-mono text-ink-secondary">Budget: {formatCurrency(cat.budget)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-oyster-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', overBudget ? 'bg-clay' : 'bg-electric-lime')}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className={cn('text-[10px] font-mono flex-shrink-0', overBudget ? 'text-clay' : 'text-ink-secondary')}>
                      {pct.toFixed(0)}%
                    </span>
                    {cat.change !== 0 && (
                      <span className={cn('text-[10px] font-mono flex items-center gap-0.5 flex-shrink-0', cat.change > 0 ? 'text-clay' : 'text-electric-lime-text')}>
                        {cat.change > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(cat.change)}%
                      </span>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Transactions */}
        <div>
          <h2 className="text-sm font-semibold text-ink mb-3">Recent Transactions</h2>
          <Card className="p-0 overflow-hidden">
            <table className="w-full">
              <thead className="bg-oyster border-b border-border">
                <tr>
                  {['Category', 'Description', 'Date', 'Type', 'Amount'].map(h => (
                    <th key={h} className="text-left text-[10px] font-mono tracking-wider text-ink-secondary uppercase px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-oyster-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-ink">{e.category}</td>
                    <td className="px-4 py-3 text-xs text-ink-secondary">{e.description}</td>
                    <td className="px-4 py-3 text-xs font-mono text-ink-secondary">{e.date}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-[10px] font-mono px-2 py-0.5 rounded-sm border',
                        e.type === 'fixed' ? 'bg-sage-surface text-sage border-sage/20'
                          : e.type === 'variable' ? 'bg-oyster-100 text-ink-secondary border-border'
                          : 'bg-clay-surface text-clay border-clay/20'
                      )}>
                        {e.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-ink">{formatCurrency(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  )
}
