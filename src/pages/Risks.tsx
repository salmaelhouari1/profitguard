import React from 'react'
import { cn, formatCurrency } from '../lib/utils'
import { SectionLabel, Card, RiskBadge, Button } from '../components/ui'
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'
import type { Alert } from '../types'
import { useAppSecurity } from '../context/SecurityContext'
import { api } from '../backend/api'
import { EmptyState } from '../components/EmptyState'

interface RisksPageProps {
  onNavigate: (page: string) => void
}

function AlertIcon({ type }: { type: Alert['type'] }) {
  switch (type) {
    case 'critical': return <XCircle size={14} className="text-clay flex-shrink-0" aria-hidden />
    case 'warning':  return <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" aria-hidden />
    case 'success':  return <CheckCircle size={14} className="text-electric-lime-text flex-shrink-0" aria-hidden />
    case 'info':     return <Info size={14} className="text-sage flex-shrink-0" aria-hidden />
  }
}

export function RisksPage({ onNavigate }: RisksPageProps) {
  const { session, currentWorkspace, loadSampleWorkspace } = useAppSecurity()
  const risks = api.getRisks(session)
  const alerts = api.getAlerts(session)

  const totalImpact = risks.reduce((s, r) => s + r.impact, 0)
  const critical = risks.filter(r => r.level === 'critical').length
  const high = risks.filter(r => r.level === 'high').length

  return (
    <div className="flex-1 overflow-auto bg-oyster">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div>
          <SectionLabel>Intelligence</SectionLabel>
          <h1 className="font-display text-2xl font-bold text-ink mt-1">Risks & Alerts</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Prioritized financial risks with evidence and recommended actions.
            {currentWorkspace?.isDemo && <span className="ml-2 text-sage font-mono font-bold">[SAMPLE DATA — READ-ONLY]</span>}
          </p>
        </div>

        {risks.length === 0 && alerts.length === 0 ? (
          <EmptyState
            title="No Risk Signals Detected"
            description="Your workspace has no active financial risk alerts. Connect your store for ProfitGuard to automatically analyze order patterns and surface margin erosion risks."
            onConnectStore={() => onNavigate('integrations')}
            onLoadSampleData={() => loadSampleWorkspace()}
          />
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Card className="p-4 border-clay/30 bg-clay-50">
                <p className="text-[10px] font-mono text-clay uppercase tracking-wider">Critical risks</p>
                <p className="text-2xl font-display font-bold text-clay mt-1">{critical}</p>
              </Card>
              <Card className="p-4">
                <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider">High risks</p>
                <p className="text-2xl font-display font-bold text-ink mt-1">{high}</p>
              </Card>
              <Card className="p-4">
                <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider">Total at risk</p>
                <p className="text-2xl font-display font-bold text-clay mt-1">{formatCurrency(totalImpact)}</p>
              </Card>
            </div>

            {/* Risk items */}
            {risks.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-ink mb-3">Financial Risks</h2>
                <div className="space-y-3">
                  {risks.map(risk => (
                    <Card key={risk.id} className={cn(
                      'p-5 border',
                      risk.level === 'critical' ? 'border-clay/25 bg-clay-50' : 'border-border bg-white'
                    )}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={16} className={cn(
                          'mt-0.5 flex-shrink-0',
                          risk.level === 'critical' ? 'text-clay' : risk.level === 'high' ? 'text-amber-500' : 'text-ink-secondary'
                        )} aria-hidden />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-sm font-semibold text-ink">{risk.title}</h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <RiskBadge level={risk.level} />
                              {risk.impact > 0 && (
                                <span className="text-xs font-mono text-clay">{formatCurrency(risk.impact)}</span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-ink-secondary leading-relaxed mb-3">{risk.description}</p>

                          {risk.evidence && (
                            <div className="bg-oyster rounded p-3 mb-3">
                              <p className="text-[10px] font-mono text-ink-secondary uppercase tracking-wider mb-1">Evidence</p>
                              <p className="text-xs text-ink leading-relaxed">{risk.evidence}</p>
                            </div>
                          )}

                          {risk.recommendation && (
                            <div className="flex items-start gap-2">
                              <span className="text-[10px] font-mono text-sage uppercase tracking-wider flex-shrink-0 mt-0.5">→ Action</span>
                              <p className="text-xs text-ink leading-relaxed">{risk.recommendation}</p>
                            </div>
                          )}

                          {risk.affectedOrders && (
                            <p className="text-[10px] font-mono text-ink-secondary mt-2">
                              {risk.affectedOrders} orders affected
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recent alerts */}
            {alerts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-ink mb-3">Recent Alerts</h2>
                <div className="space-y-2" role="list">
                  {alerts.map(alert => (
                    <div key={alert.id} className={cn(
                      'flex items-start gap-3 p-3.5 rounded-lg border',
                      alert.type === 'critical' ? 'bg-clay-50 border-clay/20'
                        : alert.type === 'success' ? 'bg-electric-lime-subtle border-electric-lime/20'
                        : 'bg-white border-border'
                    )} role="listitem">
                      <AlertIcon type={alert.type} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-ink">{alert.title}</p>
                        <p className="text-[11px] text-ink-secondary mt-0.5">{alert.description}</p>
                      </div>
                      <span className="text-[10px] font-mono text-ink-secondary flex-shrink-0">{alert.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
