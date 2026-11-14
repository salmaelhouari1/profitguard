import React from 'react'
import { cn } from '../../lib/utils'

// ─── Simple SVG-based chart components (no deps) ───────────────────────────

interface TrendChartProps {
  data: Array<{ date: string; revenue: number; profit: number; margin: number }>
  metric: 'revenue' | 'profit' | 'margin'
  className?: string
}

function getChartColor(metric: TrendChartProps['metric']) {
  switch (metric) {
    case 'revenue': return { stroke: '#1A2420', fill: 'rgba(26, 36, 32, 0.08)' }
    case 'profit':  return { stroke: '#4D6B10', fill: 'rgba(198, 232, 107, 0.25)' }
    case 'margin':  return { stroke: '#365349', fill: 'rgba(74, 110, 97, 0.18)' }
  }
}

export function TrendChart({ data, metric, className }: TrendChartProps) {
  const values = data.map(d => d[metric])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 420
  const H = 100
  const pad = { t: 8, r: 8, b: 20, l: 32 }
  const chartW = W - pad.l - pad.r
  const chartH = H - pad.t - pad.b

  const { stroke, fill } = getChartColor(metric)

  const pts = values.map((v, i) => {
    const x = pad.l + (i / (values.length - 1)) * chartW
    const y = pad.t + (1 - (v - min) / range) * chartH
    return { x, y, v, label: data[i].date }
  })

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = linePath
    + ` L${pts[pts.length - 1].x.toFixed(1)},${(H - pad.b).toFixed(1)}`
    + ` L${pts[0].x.toFixed(1)},${(H - pad.b).toFixed(1)} Z`

  // Y-axis ticks
  const ticks = [min, (min + max) / 2, max].map((v, i) => ({
    y: pad.t + (1 - (v - min) / range) * chartH,
    label: metric === 'margin' ? `${v.toFixed(0)}%` : metric === 'revenue' ? `$${(v / 1000).toFixed(0)}k` : `$${(v / 1000).toFixed(1)}k`
  }))

  // X-axis labels (every 4th)
  const xLabels = pts.filter((_, i) => i % 4 === 0 || i === pts.length - 1)

  return (
    <div className={cn('w-full', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="overflow-visible">
        {/* Y-axis ticks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y} stroke="#CBC9BF" strokeWidth="0.75" strokeDasharray="2 3" />
            <text x={pad.l - 4} y={t.y + 3} textAnchor="end" fontSize="8" fill="#4E5C55" fontWeight="600" fontFamily="IBM Plex Mono">
              {t.label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={fill} />

        {/* Line */}
        <path d={linePath} stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots at peaks */}
        {pts.map((p, i) => {
          const isLast = i === pts.length - 1
          if (!isLast) return null
          return (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={stroke} stroke="white" strokeWidth="1.5" />
          )
        })}

        {/* X labels */}
        {xLabels.map((p, i) => (
          <text key={i} x={p.x} y={H} textAnchor="middle" fontSize="8" fill="#4E5C55" fontWeight="600" fontFamily="IBM Plex Mono">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

// ─── Donut / Progress ring ─────────────────────────────────────────────────
interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  label?: string
  sublabel?: string
}

export function ProgressRing({
  value, max = 100, size = 80, strokeWidth = 6,
  color = '#C6E86B', trackColor = '#E5E3D9',
  label, sublabel
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)
  const offset = circumference * (1 - pct)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute flex flex-col items-center">
          {label && <span className="text-sm font-bold font-mono text-ink leading-none">{label}</span>}
          {sublabel && <span className="text-[9px] font-mono text-ink-secondary mt-0.5">{sublabel}</span>}
        </div>
      )}
    </div>
  )
}

// ─── Bar Chart ─────────────────────────────────────────────────────────────
interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  maxValue?: number
  className?: string
}

export function BarChart({ data, maxValue, className }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value))
  return (
    <div className={cn('space-y-3', className)}>
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs font-mono text-ink-secondary w-24 flex-shrink-0 truncate">{item.label}</span>
          <div className="flex-1 h-2 bg-oyster-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || '#C6E86B'
              }}
            />
          </div>
          <span className="text-xs font-mono text-ink w-16 text-right flex-shrink-0">
            ${item.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}
