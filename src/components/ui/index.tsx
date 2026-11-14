import React from 'react'
import { cn } from '../../lib/utils'
import type { MarginStatus, RiskLevel } from '../../types'

// ─── Status Badge ──────────────────────────────────────────────────────────
interface StatusBadgeProps {
  status: MarginStatus
  className?: string
}

const statusConfig: Record<MarginStatus, { label: string; className: string }> = {
  healthy:  { label: 'Healthy',       className: 'bg-[#E1F3BD] text-[#0F2D06] border border-[#96C72E] font-bold' },
  low:      { label: 'Low Margin',    className: 'bg-[#ECE8DC] text-[#111916] border border-[#8A877A] font-semibold' },
  negative: { label: 'Negative',      className: 'bg-[#FCE6DE] text-[#7A1E00] border border-[#E07954] font-bold' },
  missing:  { label: 'Missing Cost',  className: 'bg-[#DDE9E3] text-[#143428] border border-[#6B9886] font-semibold' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono tracking-wide', cfg.className, className)}>
      {cfg.label}
    </span>
  )
}

// ─── Risk Level Badge ──────────────────────────────────────────────────────
const riskConfig: Record<RiskLevel, { label: string; dot: string; className: string }> = {
  critical: { label: 'Critical', dot: 'bg-clay',          className: 'text-clay font-bold' },
  high:     { label: 'High',     dot: 'bg-[#B45309]',     className: 'text-[#B45309] font-bold' },
  medium:   { label: 'Medium',   dot: 'bg-ink-secondary', className: 'text-ink-secondary font-semibold' },
  low:      { label: 'Low',      dot: 'bg-sage',          className: 'text-sage font-semibold' },
}

interface RiskBadgeProps {
  level: RiskLevel
  className?: string
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const cfg = riskConfig[level]
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-mono', cfg.className, className)}>
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

// ─── Demo Banner ───────────────────────────────────────────────────────────
export function DemoBanner() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#DDE9E3] border border-[#5B8676]/60 shadow-sm">
      <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
      <span className="text-xs font-bold text-sage font-mono tracking-widest">DEMO DATA · ESTIMATED</span>
    </div>
  )
}

// ─── Section Label ─────────────────────────────────────────────────────────
interface SectionLabelProps {
  children: React.ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p className={cn('text-xs font-bold font-mono tracking-widest uppercase text-sage', className)}>
      {children}
    </p>
  )
}

// ─── Metric Delta ──────────────────────────────────────────────────────────
interface MetricDeltaProps {
  value: number
  suffix?: string
  className?: string
}

export function MetricDelta({ value, suffix = '%', className }: MetricDeltaProps) {
  const isPositive = value >= 0
  return (
    <span className={cn(
      'text-xs font-mono font-bold',
      isPositive ? 'text-[#1B4A0E]' : 'text-clay',
      className
    )}>
      {isPositive ? '▲' : '▼'} {Math.abs(value).toFixed(1)}{suffix}
    </span>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-oyster-100 border border-border flex items-center justify-center mb-4 text-ink-secondary">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-ink mb-1">{title}</p>
      <p className="text-sm text-ink-secondary max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-oyster-200', className)} />
}

// ─── Button ────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-electric-lime text-electric-lime-text hover:bg-electric-lime-hover font-bold shadow-sm',
    secondary: 'bg-deep-ink text-white hover:bg-deep-ink-light font-semibold shadow-sm',
    ghost: 'text-ink hover:text-deep-ink hover:bg-oyster-200 font-medium',
    outline: 'border border-border text-ink hover:bg-white hover:border-border-strong font-medium shadow-card',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded',
    md: 'px-4 py-2 text-sm rounded',
    lg: 'px-6 py-3 text-sm rounded-md',
  }
  return (
    <button
      className={cn('inline-flex items-center gap-2 transition-colors duration-150 cursor-pointer', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── Input ─────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-ink">{label}</label>}
      <input
        className={cn(
          'h-9 px-3 rounded bg-white border border-border text-sm text-ink placeholder:text-ink-muted shadow-card',
          'focus:outline-none focus:ring-2 focus:ring-electric-lime/50 focus:border-border-strong',
          'transition-colors duration-150',
          className
        )}
        {...props}
      />
    </div>
  )
}

// ─── Card ──────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'section' | 'article'
}

export function Card({ children, className, as: Tag = 'div' }: CardProps) {
  return (
    <Tag className={cn('bg-white border border-border shadow-card rounded-lg p-5', className)}>
      {children}
    </Tag>
  )
}

// ─── Trend Sparkline (SVG-based) ───────────────────────────────────────────
interface SparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
}

export function Sparkline({ data, color = '#C6E86B', width = 80, height = 32 }: SparklineProps) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <polyline
        points={pts.join(' ')}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
