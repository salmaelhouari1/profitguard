import React from 'react'
import { DemoBanner, SectionLabel, Card } from '../components/ui'
import { TrendChart, BarChart } from '../components/charts'
import { trendData, marketingChannels, financialSummary } from '../data/demo'
import { formatCurrency } from '../lib/utils'

interface AnalyticsPageProps {
  onNavigate: (page: string) => void
}

export function AnalyticsPage({ onNavigate }: AnalyticsPageProps) {
  const fs = financialSummary
  const channelData = marketingChannels.map(c => ({
    label: c.name,
    value: c.attributedRevenue,
    color: c.status === 'unprofitable' ? '#C77B5B' : '#C6E86B'
  }))

  return (
    <div className="flex-1 overflow-auto bg-oyster">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <DemoBanner />
          <div className="mt-4">
            <SectionLabel>Workspace</SectionLabel>
            <h1 className="font-display text-2xl font-bold text-ink mt-1">Analytics</h1>
            <p className="text-sm text-ink-secondary mt-1">Revenue, profit and marketing performance at a glance.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Revenue Trend</h3>
            <TrendChart data={trendData} metric="revenue" />
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Profit Trend</h3>
            <TrendChart data={trendData} metric="profit" />
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Margin Trend</h3>
            <TrendChart data={trendData} metric="margin" />
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Revenue by Channel</h3>
            <BarChart data={channelData} />
          </Card>
        </div>
      </div>
    </div>
  )
}
