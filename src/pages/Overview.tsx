import React, { useState } from 'react'
import { cn, formatCurrency, formatNumber } from '../lib/utils'
import { financialSummary, trendData, products, risks, alerts } from '../data/demo'
import { TrendChart } from '../components/charts'
import { DemoBanner, SectionLabel, MetricDelta, Card, Button, StatusBadge, RiskBadge } from '../components/ui'
import { TrendingUp, ArrowUpRight, AlertTriangle, BrainCircuit, ChevronRight } from 'lucide-react'

type DateFilter = '7d' | '30d' | '90d' | 'custom'

interface OverviewPageProps {
  onNavigate: (page: string) => void
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('30d')
  const [chartMetric, setChartMetric] = useState<'revenue' | 'profit' | 'margin'>('revenue')

  const fs = financialSummary
  const revDelta = ((fs.revenue - fs.comparisonPeriod.revenue) / fs.comparisonPeriod.revenue) * 100
  const marginDelta = fs.profitMargin - fs.comparisonPeriod.profitMargin
  const profitDelta = ((fs.contributionProfit - fs.comparisonPeriod.contributionProfit) / fs.comparisonPeriod.contributionProfit) * 100

  const topProducts = [...products].sort((a, b) => b.contributionProfit - a.contributionProfit).slice(0, 4)
  const decliningProducts = [...products].filter(p => p.trend === 'down').slice(0, 3)
  const criticalRisks = risks.filter(r => r.level === 'critical' || r.level === 'high').slice(0, 3)

  return (
    <div className="flex-1 overflow-auto bg-oyster">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* ── Hero Section ── */}
        <section>
          <DemoBanner />
          <div className="mt-5 mb-8">
            <h1 className="font-display text-3xl font-extrabold text-deep-ink tracking-tight leading-tight">
              Know your margins.
            </h1>
            <p className="text-ink-secondary font-medium mt-1.5 text-base">Your business, beyond revenue.</p>
          </div>

          {/* Main financial summary + secondary KPIs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Primary summary panel */}
            <div className="lg:col-span-1 bg-deep-ink rounded-xl p-6 flex flex-col justify-between min-h-[220px] shadow-editorial border border-deep-ink-border">
              <div>
                <p className="text-[11px] font-mono tracking-widest text-[#9EC2B4] uppercase font-bold mb-3">
                  Contribution Profit · {fs.dateRange}
                </p>
                <div className="text-5xl font-display font-extrabold text-electric-lime leading-none drop-shadow-sm">
                  {formatCurrency(fs.contributionProfit)}
                </div>
                <div className="mt-3.5 flex items-center gap-3">
                  <MetricDelta value={profitDelta} className="text-sm font-bold" />
                  <span className="text-[#A6C9BC] text-xs font-medium">vs. prior period</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-deep-ink-border flex items-center gap-7">
                <div>
                  <p className="text-[10px] font-mono text-[#9EC2B4] font-bold uppercase tracking-wider">Revenue</p>
                  <p className="text-xl font-display font-bold text-white mt-0.5">{formatCurrency(fs.revenue)}</p>
                  <MetricDelta value={revDelta} className="text-xs" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[#9EC2B4] font-bold uppercase tracking-wider">Margin</p>
                  <p className="text-xl font-display font-bold text-white mt-0.5">{fs.profitMargin}%</p>
                  <MetricDelta value={marginDelta} className="text-xs" />
                </div>
              </div>
            </div>

            {/* Secondary KPIs grid */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {[
                { label: 'Orders',          value: formatNumber(fs.orders),              sub: 'this period',        color: 'text-ink' },
                { label: 'Avg. Order Value',value: formatCurrency(fs.avgOrderValue),     sub: 'per order',          color: 'text-ink' },
                { label: 'Profit at Risk',  value: formatCurrency(fs.profitAtRisk),      sub: 'needs attention',    color: 'text-clay' },
                { label: 'Ad Spend',        value: formatCurrency(fs.advertisingSpend),  sub: 'total spend',        color: 'text-ink' },
                { label: 'Gross Profit',    value: formatCurrency(fs.grossProfit),        sub: 'before overhead',    color: 'text-ink' },
                { label: 'Date Range',      value: 'Oct 2026',                           sub: fs.dateRange,         color: 'text-sage' },
              ].map((kpi, i) => (
                <div key={i} className="bg-white border border-border shadow-card rounded-lg p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-mono text-ink-muted uppercase tracking-wider font-bold mb-1.5">{kpi.label}</p>
                    <p className={cn('text-2xl font-display font-extrabold leading-none', kpi.color)}>{kpi.value}</p>
                  </div>
                  <p className="text-xs font-medium text-ink-secondary mt-2">{kpi.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── A. Profit Performance ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <SectionLabel>Profit Performance</SectionLabel>
              <h2 className="font-display text-xl font-bold text-ink mt-1">Revenue, profit & margin trend</h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Metric toggles */}
              <div className="flex border border-border rounded overflow-hidden text-xs shadow-card">
                {(['revenue', 'profit', 'margin'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setChartMetric(m)}
                    className={cn(
                      'px-3 py-1.5 font-mono capitalize font-bold transition-colors',
                      chartMetric === m
                        ? 'bg-deep-ink text-white'
                        : 'bg-white text-ink hover:bg-oyster-100'
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {/* Date filters */}
              <div className="flex border border-border rounded overflow-hidden text-xs shadow-card">
                {(['7d', '30d', '90d'] as DateFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setDateFilter(f)}
                    className={cn(
                      'px-3 py-1.5 font-mono font-bold transition-colors',
                      dateFilter === f
                        ? 'bg-electric-lime text-electric-lime-text'
                        : 'bg-white text-ink hover:bg-oyster-100'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Card className="p-6">
            <div className="flex items-center gap-6 mb-5 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 rounded-full" style={{ backgroundColor: chartMetric === 'revenue' ? '#111916' : chartMetric === 'profit' ? '#4D6B10' : '#2D5446' }} />
                <span className="font-mono text-ink font-bold capitalize">{chartMetric}</span>
              </div>
              <div className="text-ink font-display font-extrabold text-base">
                {chartMetric === 'revenue'
                  ? formatCurrency(fs.revenue)
                  : chartMetric === 'profit'
                    ? formatCurrency(fs.contributionProfit)
                    : `${fs.profitMargin}%`
                }
              </div>
              <MetricDelta value={chartMetric === 'margin' ? marginDelta : profitDelta} />
            </div>
            <TrendChart data={trendData} metric={chartMetric} />
          </Card>
        </section>

        {/* ── B. Business Performance ── */}
        <section>
          <SectionLabel className="mb-4">Business Performance</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Top products */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-ink">Best-performing products</h3>
                <button onClick={() => onNavigate('products')} className="text-xs font-semibold text-sage hover:text-sage-hover flex items-center gap-1 transition-colors">
                  View all <ArrowUpRight size={13} className="stroke-[2.5]" />
                </button>
              </div>
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-ink-muted w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-ink truncate">{p.name}</p>
                      <p className="text-[11px] font-mono font-medium text-ink-muted">{p.sku}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-mono font-bold text-ink">{formatCurrency(p.contributionProfit)}</p>
                      <p className="text-[11px] font-mono font-bold text-sage">{p.margin.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Declining margins */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-ink">Declining margins</h3>
                <button onClick={() => onNavigate('products')} className="text-xs font-semibold text-sage hover:text-sage-hover flex items-center gap-1 transition-colors">
                  View all <ArrowUpRight size={13} className="stroke-[2.5]" />
                </button>
              </div>
              <div className="space-y-3">
                {decliningProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-2.5 rounded bg-clay-surface border border-clay/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-ink truncate">{p.name}</p>
                      <p className="text-[11px] font-mono font-semibold text-ink-secondary">{p.margin.toFixed(1)}% margin</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <StatusBadge status={p.status} />
                      <p className="text-[11px] font-mono font-bold text-clay mt-1">▼ {Math.abs(p.trendValue).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* ── C. ProfitGuard Intelligence ── */}
        <section>
          <SectionLabel className="mb-4">ProfitGuard Intelligence</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Critical risks */}
            <div className="lg:col-span-2 space-y-3">
              {criticalRisks.map(risk => (
                <div
                  key={risk.id}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border shadow-card',
                    risk.level === 'critical'
                      ? 'bg-clay-surface border-clay/40'
                      : 'bg-white border-border'
                  )}
                >
                  <AlertTriangle
                    size={18}
                    className={cn('mt-0.5 flex-shrink-0 stroke-[2.5]', risk.level === 'critical' ? 'text-clay' : 'text-[#B45309]')}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-bold text-ink">{risk.title}</p>
                      <RiskBadge level={risk.level} className="flex-shrink-0" />
                    </div>
                    <p className="text-xs font-medium text-ink-secondary leading-relaxed">{risk.description}</p>
                    {risk.impact > 0 && (
                      <p className="mt-2 text-xs font-mono font-bold text-clay">
                        Financial impact: {formatCurrency(risk.impact)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => onNavigate('risks')}
                className="w-full py-2.5 text-xs font-bold text-sage hover:text-sage-hover border-2 border-dashed border-border-strong rounded-lg hover:bg-white transition-colors"
              >
                View all risks & alerts →
              </button>
            </div>

            {/* AI Analyst CTA */}
            <div className="bg-deep-ink rounded-xl p-5 flex flex-col shadow-editorial border border-deep-ink-border">
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit size={18} className="text-electric-lime stroke-[2.5]" />
                <p className="text-sm font-bold text-white">AI Analyst</p>
              </div>
              <p className="text-xs text-[#A6C9BC] leading-relaxed mb-4">
                Ask evidence-based questions about your profitability, orders, and product performance.
              </p>
              <div className="space-y-2 mb-5">
                {[
                  '"Which orders are unprofitable?"',
                  '"What is eating my margins?"',
                  '"Where should I cut ad spend?"',
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onNavigate('ai-analyst')}
                    className="w-full text-left text-[11px] text-[#D0E2DC] hover:text-electric-lime px-3 py-2 rounded border border-deep-ink-border hover:border-electric-lime/40 transition-colors font-mono font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center mt-auto"
                onClick={() => onNavigate('ai-analyst')}
              >
                Open AI Analyst <ArrowUpRight size={13} className="stroke-[2.5]" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
