import React from 'react';
import { Button } from './ui';
import { ArrowRight, Database, PlugZap, ShieldAlert } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onConnectStore?: () => void;
  onLoadSampleData?: () => void;
  isSampleLoading?: boolean;
}

export function EmptyState({
  title = 'No Store Connected Yet',
  description = 'ProfitGuard is operating in live production mode with zero hardcoded sample records. Connect your live Shopify store or load an isolated sample workspace to explore metrics.',
  onConnectStore,
  onLoadSampleData,
  isSampleLoading = false,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-chalk border border-border/70 my-6 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-oyster flex items-center justify-center mb-5 border border-border">
        <PlugZap className="w-7 h-7 text-ink" />
      </div>

      <h3 className="text-xl font-bold font-serif text-ink mb-2">{title}</h3>
      <p className="text-sm text-ink-muted max-w-lg mb-8 leading-relaxed font-sans">{description}</p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {onConnectStore && (
          <Button
            variant="primary"
            onClick={onConnectStore}
            className="flex items-center gap-2 px-6 py-2.5 font-bold"
          >
            <PlugZap className="w-4 h-4" />
            Connect Shopify Store
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}

        {onLoadSampleData && (
          <Button
            variant="secondary"
            onClick={onLoadSampleData}
            disabled={isSampleLoading}
            className="flex items-center gap-2 px-5 py-2.5 font-semibold text-ink"
          >
            <Database className="w-4 h-4 text-ink-secondary" />
            {isSampleLoading ? 'Creating Sample Workspace...' : 'Load Sample Data (Demo)'}
          </Button>
        )}
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs font-mono text-ink-muted bg-oyster px-4 py-2 rounded-md border border-border/50">
        <ShieldAlert className="w-3.5 h-3.5 text-sage" />
        Sample workspaces are isolated and read-only. Live customer financials are never mixed.
      </div>
    </div>
  );
}
