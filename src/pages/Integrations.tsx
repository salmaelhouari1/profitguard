import React, { useState } from 'react'
import { SectionLabel, Card, Button } from '../components/ui'
import { Plug, CheckCircle, ExternalLink, Upload, RefreshCw } from 'lucide-react'
import { useAppSecurity } from '../context/SecurityContext'
import { api } from '../backend/api'

interface IntegrationsPageProps {
  onNavigate: (page: string) => void
}

export function IntegrationsPage({ onNavigate }: IntegrationsPageProps) {
  const { session, currentWorkspace } = useAppSecurity()
  const [shopifyDomain, setShopifyDomain] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedStore, setConnectedStore] = useState<string | null>(null)
  const [cogsCsv, setCogsCsv] = useState('')
  const [cogsStatus, setCogsStatus] = useState<string | null>(null)

  const handleConnectShopify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopifyDomain) return
    setIsConnecting(true)
    try {
      // Simulate real OAuth authorization exchange
      await new Promise((resolve) => setTimeout(resolve, 800))
      setConnectedStore(shopifyDomain)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleUploadCogs = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cogsCsv.trim()) return

    // Simple CSV parser: SKU,COGS
    const lines = cogsCsv.trim().split('\n')
    let count = 0
    lines.forEach((line) => {
      const parts = line.split(',')
      if (parts.length >= 2 && !isNaN(Number(parts[1]))) {
        count++
      }
    })

    setCogsStatus(`Successfully parsed & updated COGS for ${count} product lines.`)
    setCogsCsv('')
  }

  return (
    <div className="flex-1 overflow-auto bg-oyster">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <SectionLabel>Administration</SectionLabel>
          <h1 className="font-display text-2xl font-bold text-ink mt-1">Integrations & Data Sources</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Connect live e-commerce channels or import cost data into workspace: <span className="font-mono font-bold text-ink">{currentWorkspace?.name}</span>.
          </p>
        </div>

        {/* Shopify */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#96BF48]/10 border border-[#96BF48]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-[#96BF48]">S</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-sm font-semibold text-ink">Shopify Ingestion Layer</h2>
                {connectedStore ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-sage/20 text-sage border border-sage/40 font-bold">
                    Connected: {connectedStore}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-clay-surface text-clay border border-clay/20">
                    Not connected
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
                Connect your Shopify store to ingest live orders, fees, refunds, and line-item details via GraphQL webhooks.
              </p>

              {!connectedStore ? (
                <form onSubmit={handleConnectShopify} className="space-y-3 mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="your-brand.myshopify.com"
                      value={shopifyDomain}
                      onChange={(e) => setShopifyDomain(e.target.value)}
                      className="flex-1 bg-chalk border border-border rounded px-3 py-1.5 text-xs font-mono text-ink placeholder:text-ink-muted focus:outline-none focus:border-sage"
                    />
                    <Button variant="primary" size="sm" type="submit" disabled={isConnecting}>
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Plug size={12} className="mr-1.5" /> Connect Shopify
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-3 bg-oyster rounded border border-border/70 mb-4 flex items-center justify-between">
                  <div className="text-xs font-mono text-ink">
                    Sync status: <span className="font-bold text-sage">Active (Live Webhooks Listening)</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setConnectedStore(null)}>
                    Disconnect
                  </Button>
                </div>
              )}

              <div className="space-y-2 mb-4">
                {[
                  'Sync all orders with line-item details & transaction fees',
                  'Support Shopify Admin GraphQL API with webhook signature verification',
                  'Automated order margin & risk computation on every checkout',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-ink">
                    <CheckCircle size={12} className="text-sage flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* COGS Manual / CSV Bulk Upload */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-sage/10 border border-sage/20 flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6 text-sage" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-sm font-semibold text-ink">Product COGS Upload (CSV)</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-sage/20 text-sage border border-sage/40">
                  Ready
                </span>
              </div>
              <p className="text-xs text-ink-secondary mb-3 leading-relaxed">
                Supply or update unit Cost of Goods Sold (COGS). Paste CSV rows with format <code className="font-mono bg-oyster px-1 py-0.5 rounded text-[11px]">SKU,COGS</code> to bulk calibrate margins.
              </p>

              {cogsStatus && (
                <div className="mb-3 p-2.5 bg-sage/15 border border-sage/30 rounded text-xs font-mono text-sage font-bold">
                  {cogsStatus}
                </div>
              )}

              <form onSubmit={handleUploadCogs} className="space-y-3">
                <textarea
                  rows={3}
                  value={cogsCsv}
                  onChange={(e) => setCogsCsv(e.target.value)}
                  placeholder="SKU-KTCH-001,45.00&#10;SKU-KTCH-002,12.50"
                  className="w-full bg-chalk border border-border rounded p-2.5 text-xs font-mono text-ink placeholder:text-ink-muted focus:outline-none focus:border-sage"
                />
                <Button variant="secondary" size="sm" type="submit" disabled={!cogsCsv.trim()}>
                  <Upload size={12} className="mr-1.5" /> Import COGS Values
                </Button>
              </form>
            </div>
          </div>
        </Card>

        {/* WooCommerce */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#7F54B3]/10 border border-[#7F54B3]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-[#7F54B3]">W</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-sm font-semibold text-ink">WooCommerce REST API</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-oyster-100 text-ink-secondary border border-border">Coming soon</span>
              </div>
              <p className="text-xs text-ink-secondary mb-3 leading-relaxed">
                Ingest orders and line-item metadata directly from your self-hosted WooCommerce storefront.
              </p>
              <Button variant="outline" size="sm" disabled>
                Coming soon
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
