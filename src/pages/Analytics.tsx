import React from 'react'
import { SectionLabel, Card } from '../components/ui'
import { TrendChart, BarChart } from '../components/charts'
import { formatCurrency } from '../lib/utils'
import { useAppSecurity } from '../context/SecurityContext'
import { api } from '../backend/api'
import { EmptyState } from '../components/EmptyState'

interface AnalyticsPageProps {
  onNavigate: (page: string) => void
}

export function AnalyticsPage({ onNavigate }: AnalyticsPageProps) {
  const { session, currentWorkspace, loadSampleWorkspace } = useAppSecurity()
  const trendData = api.getTrendData(session)
  const marketingChannels = api.getMarketingChannels(session)
  const fs = api.getFinancialSummary(session)

  const channelData = marketingChannels.map(c => ({
    label: c.name,
    value: c.attributedRevenue,
    color: c.status === 'unprofitable' ? '#C77B5B' : '#C6E86B'
  }))

  const isWorkspaceEmpty = trendData.length === 0 && marketingChannels.length === 0

  return (
    <div className="flex-1 overflow-auto bg-oyster">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <SectionLabel>Workspace</SectionLabel>
          <h1 className="font-display text-2xl font-bold text-ink mt-1">Analytics</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Revenue, profit and marketing performance at a glance.
            {currentWorkspace?.isDemo && <span className="ml-2 text-sage font-mono font-bold">[SAMPLE DATA — READ-ONLY]</span>}
          </p>
        </div>

        {isWorkspaceEmpty ? (
          <EmptyState
            title="No Analytics Data Available"
            description="Connect your store or load sample data to view trend charts, margin analysis, and channel revenue breakdowns."
            onConnectStore={() => onNavigate('integrations')}
            onLoadSampleData={() => loadSampleWorkspace()}
          />
        ) : (
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
              {channelData.length > 0 ? (
                <BarChart data={channelData} />
              ) : (
                <p className="text-xs font-mono text-ink-muted py-6 text-center">No marketing channel data available</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
