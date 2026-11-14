import React, { useState } from 'react'
import { DemoBanner, SectionLabel, Card, Button, Input } from '../components/ui'
import { Save } from 'lucide-react'

interface SettingsPageProps {
  onNavigate: (page: string) => void
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const [storeName, setStoreName] = useState('Demo Kitchen Co.')
  const [currency, setCurrency] = useState('USD')
  const [targetMargin, setTargetMargin] = useState('20')
  const [defaultProductCost, setDefaultProductCost] = useState('0')
  const [defaultShipping, setDefaultShipping] = useState('8')
  const [paymentFee, setPaymentFee] = useState('2.9')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex-1 overflow-auto bg-oyster">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div>
          <SectionLabel>Administration</SectionLabel>
          <h1 className="font-display text-2xl font-bold text-ink mt-1">Settings</h1>
          <p className="text-sm text-ink-secondary mt-1">Store configuration, currency, timezone and financial assumptions.</p>
        </div>

        {/* Integration status */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink mb-3">Shopify Connection</h2>
          <div className="p-3.5 rounded-md border border-clay/20 bg-clay-50 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-clay" />
              <p className="text-xs font-semibold text-clay">Shopify not connected</p>
            </div>
            <p className="text-xs text-ink-secondary">
              Store: {storeName} · Add your Shopify Admin API key in Integrations to activate live sync.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => onNavigate('integrations')}>
            Go to Integrations
          </Button>
        </Card>

        {/* Store economics */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Store Economics</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Store name"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-secondary">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="h-9 px-3 rounded bg-white border border-border text-sm text-ink focus:outline-none focus:ring-2 focus:ring-electric-lime/50 focus:border-electric-lime/70 transition-colors"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>CAD</option>
              </select>
            </div>
            <Input
              label="Target profit margin (%)"
              type="number"
              value={targetMargin}
              onChange={e => setTargetMargin(e.target.value)}
            />
            <Input
              label="Default product cost ($)"
              type="number"
              value={defaultProductCost}
              onChange={e => setDefaultProductCost(e.target.value)}
            />
            <Input
              label="Default shipping cost ($)"
              type="number"
              value={defaultShipping}
              onChange={e => setDefaultShipping(e.target.value)}
            />
            <Input
              label="Payment fee (%)"
              type="number"
              step="0.1"
              value={paymentFee}
              onChange={e => setPaymentFee(e.target.value)}
            />
          </div>
          <p className="text-[10px] text-ink-secondary mt-3 leading-relaxed">
            These values are used for estimated profit calculations when order-level data is unavailable.
          </p>
        </Card>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button variant="primary" size="md" onClick={handleSave}>
            <Save size={14} />
            {saved ? 'Saved!' : 'Save settings'}
          </Button>
          {saved && <p className="text-xs text-sage">Settings saved successfully.</p>}
        </div>
      </div>
    </div>
  )
}
