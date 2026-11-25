import React from 'react'
import { cn, formatCurrency, formatRoas } from '../lib/utils'
import { SectionLabel, Card } from '../components/ui'
import type { MarketingChannel } from '../types'
import { useAppSecurity } from '../context/SecurityContext'
import { api } from '../backend/api'
import { EmptyState } from '../components/EmptyState'

interface MarketingPageProps {
  onNavigate: (page: string) => void
}

function ChannelStatus({ status }: { status: MarketingChannel['status'] }) {
  const cfg = {
    profitable:   { label: 'Profitable',   className: 'bg-electric-lime-subtle text-electric-lime-text border border-electric-lime/30' },
    'break-even': { label: 'Break-even',   className: 'bg-oyster-100 text-ink-secondary border border-border' },
    unprofitable: { label: 'Unprofitable', className: 'bg-clay-surface text-clay border border-clay/30' },
  }[status]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-mono font-medium border', cfg.className)}>
      {cfg.label}
    </span>
  )
}

export function MarketingPage({ onNavigate }: MarketingPageProps) {
  const { session, currentWorkspace, loadSampleWorkspace } = useAppSecurity()
  const marketingChannels = api.getMarketingChannels(session)

  const totalSpend = marketingChannels.reduce((s, c) => s + c.spend, 0)
  const totalRevenue = marketingChannels.reduce((s, c) => s + c.attributedRevenue, 0)
  const totalContrib = marketingChannels.reduce((s, c) => s + c.contributionAfterAds, 0)
  const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0

  return (
    <div className="flex-1 overflow-auto bg-oyster">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div>
          <SectionLabel>Operations</SectionLabel>
          <h1 className="font-display text-2xl font-bold text-ink mt-1">Marketing Efficiency</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Ad spend, attributed revenue, ROAS and contribution after advertising by channel.
            {currentWorkspace?.isDemo && <span className="ml-2 text-sage font-mono font-bold">[SAMPLE DATA — READ-ONLY]</span>}
          </p>
        </div>

        {marketingChannels.length === 0 ? (
          <EmptyState
            title="No Marketing Channels"
            description="No ad spend data is available for this workspace. Connect your store or load sample data to view ROAS, break-even analysis, and channel performance."
            onConnectStore={() => onNavigate('integrations')}
            onLoadSampleData={() => loadSampleWorkspace()}
          />
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Ad Spend',         value: formatCurrency(totalSpend) },
                { label: 'Attributed Revenue',      value: formatCurrency(totalRevenue) },
                { label: 'Blended ROAS',            value: formatRoas(blendedRoas), highlight: blendedRoas >= 3.2 },
                { label: 'Contribution After Ads',  value: formatCurrency(totalContrib), highlight: totalContrib > 0 },
              ].map((s, i) => (
                <Card key={i} className="p-4">
                  <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider">{s.label}</p>
                  <p className={cn('text-xl font-display font-bold mt-1', s.highlight === true ? 'text-electric-lime-text' : s.highlight === false ? 'text-clay' : 'text-ink')}>
                    {s.value}
                  </p>
                </Card>
              ))}
            </div>

            {/* Channel breakdown */}
            <div className="space-y-3">
              {marketingChannels.map(ch => {
                const roasAboveBreakEven = ch.roas >= ch.breakEvenRoas
                return (
                  <Card key={ch.id} className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-sm font-semibold text-ink">{ch.name}</h3>
                          <ChannelStatus status={ch.status} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider mb-1">Spend</p>
                            <p className="text-sm font-mono font-semibold text-ink">{ch.spend > 0 ? formatCurrency(ch.spend) : '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider mb-1">Attributed Revenue</p>
                            <p className="text-sm font-mono font-semibold text-ink">{formatCurrency(ch.attributedRevenue)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider mb-1">ROAS</p>
                            <div className="flex items-baseline gap-1.5">
                              <p className={cn('text-sm font-mono font-semibold', ch.spend === 0 ? 'text-ink-secondary' : roasAboveBreakEven ? 'text-electric-lime-text' : 'text-clay')}>
                                {ch.spend === 0 ? 'Organic' : formatRoas(ch.roas)}
                              </p>
                              {ch.spend > 0 && (
                                <span className="text-[10px] font-mono text-ink-secondary">
                                  / {formatRoas(ch.breakEvenRoas)} B/E
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider mb-1">Contribution</p>
                            <p className={cn('text-sm font-mono font-semibold', ch.contributionAfterAds < 0 ? 'text-clay' : 'text-ink')}>
                              {formatCurrency(ch.contributionAfterAds)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* ROAS gauge */}
                      {ch.spend > 0 && (
                        <div className="sm:w-32 flex-shrink-0">
                          <div className="flex justify-between text-[9px] font-mono text-ink-secondary mb-1">
                            <span>0×</span>
                            <span className="text-ink-secondary">B/E {formatRoas(ch.breakEvenRoas)}</span>
                          </div>
                          <div className="relative h-2 bg-oyster-100 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all', roasAboveBreakEven ? 'bg-electric-lime' : 'bg-clay')}
                              style={{ width: `${Math.min((ch.roas / (ch.breakEvenRoas * 1.8)) * 100, 100)}%` }}
                            />
                            <div
                              className="absolute top-0 bottom-0 w-px bg-ink-secondary"
                              style={{ left: `${(ch.breakEvenRoas / (ch.breakEvenRoas * 1.8)) * 100}%` }}
                            />
                          </div>
                          <p className={cn('text-[10px] font-mono mt-1 text-center', roasAboveBreakEven ? 'text-electric-lime-text' : 'text-clay')}>
                            {formatRoas(ch.roas)} ROAS
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
