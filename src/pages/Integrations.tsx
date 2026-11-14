import React from 'react'
import { DemoBanner, SectionLabel, Card, Button } from '../components/ui'
import { Plug, CheckCircle, ExternalLink } from 'lucide-react'

interface IntegrationsPageProps {
  onNavigate: (page: string) => void
}

export function IntegrationsPage({ onNavigate }: IntegrationsPageProps) {
  return (
    <div className="flex-1 overflow-auto bg-oyster">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <SectionLabel>Administration</SectionLabel>
          <h1 className="font-display text-2xl font-bold text-ink mt-1">Integrations</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Connect your e-commerce store to replace demo data with live order and product data.
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
                <h2 className="text-sm font-semibold text-ink">Shopify</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-clay-surface text-clay border border-clay/20">Not connected</span>
              </div>
              <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
                Connect your Shopify store to sync orders, products, and customer data into ProfitGuard. Requires a private app API key.
              </p>
              <div className="space-y-2 mb-5">
                {[
                  'Sync all orders with line-item details',
                  'Import product costs (COGS) from metafields',
                  'Real-time profit and margin calculation',
                  'Automatic risk detection on new orders',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-ink">
                    <CheckCircle size={12} className="text-sage flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm">
                  <Plug size={12} /> Connect Shopify
                </Button>
                <button className="text-xs text-sage hover:text-sage-hover flex items-center gap-1 transition-colors">
                  View setup guide <ExternalLink size={10} />
                </button>
              </div>
              <p className="text-[10px] text-ink-secondary mt-3">
                Your API credentials are stored securely and never exposed in the frontend.
              </p>
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
                <h2 className="text-sm font-semibold text-ink">WooCommerce</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-oyster-100 text-ink-secondary border border-border">Coming soon</span>
              </div>
              <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
                WooCommerce integration is in development. Connect via REST API credentials when available.
              </p>
              <Button variant="outline" size="sm" disabled>
                Coming soon
              </Button>
            </div>
          </div>
        </Card>

        {/* Data note */}
        <div className="p-4 rounded-lg border border-sage/20 bg-sage-surface">
          <p className="text-xs font-semibold text-sage mb-1">About demo data</p>
          <p className="text-xs text-ink-secondary leading-relaxed">
            ProfitGuard currently shows realistic demo data for the fictional "Demo Kitchen Co." store. All financial figures are illustrative. Connect a real store to see live data.
          </p>
        </div>
      </div>
    </div>
  )
}
