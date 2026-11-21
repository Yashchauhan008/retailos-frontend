import { clsx } from 'clsx'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

type WithClass = { className?: string; children?: ReactNode }

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-xl disabled:opacity-50 disabled:pointer-events-none',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        variant === 'primary' && 'bg-accent text-white shadow-sm hover:bg-accent-hover',
        variant === 'secondary' && 'bg-gray-900 text-white hover:bg-gray-800',
        variant === 'ghost' && 'bg-transparent text-gray-600 hover:bg-gray-100',
        variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
        variant === 'outline' &&
          'border border-gray-200 bg-white text-gray-800 hover:border-gray-300',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({
  className,
  children,
  padding = true,
}: WithClass & { padding?: boolean }) {
  return (
    <div
      className={clsx(
        'rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] border border-gray-100/80',
        padding && 'p-5 md:p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Input({
  className,
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <input
        className={clsx(
          'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition',
          'placeholder:text-gray-400 focus:border-accent focus:ring-2 focus:ring-accent/20',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  )
}

export function Select({
  className,
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <select
        className={clsx(
          'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none',
          'focus:border-accent focus:ring-2 focus:ring-accent/20',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

export function Badge({
  className,
  children,
  variant = 'default',
}: WithClass & { variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variant === 'default' && 'bg-gray-100 text-gray-700',
        variant === 'success' && 'bg-emerald-50 text-emerald-700',
        variant === 'warning' && 'bg-amber-50 text-amber-700',
        variant === 'danger' && 'bg-red-50 text-red-700',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={clsx(
          'relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6',
          size === 'sm' && 'max-w-md',
          size === 'md' && 'max-w-lg',
          size === 'lg' && 'max-w-2xl',
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-gray-900">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </Card>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        'h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-accent',
        className,
      )}
    />
  )
}

export function Table({
  headers,
  children,
  rows,
  empty,
}: {
  headers: string[]
  children?: ReactNode
  rows?: ReactNode[][]
  empty?: string
}) {
  const body =
    rows != null ? (
      rows.length ? (
        rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-3 text-gray-700">
                {cell}
              </td>
            ))}
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={headers.length} className="px-4 py-8 text-center text-gray-500">
            {empty || 'No data'}
          </td>
        </tr>
      )
    ) : (
      children
    )

  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-gray-100 bg-white shadow-[var(--shadow-card)]">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">{body}</tbody>
      </table>
    </div>
  )
}

export function KpiCard({
  title,
  label,
  value,
  change,
  icon,
}: {
  title?: string
  label?: string
  value: string
  change?: string
  icon?: ReactNode
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title || label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
          {change && <p className="mt-2 text-xs font-medium text-emerald-600">{change}</p>}
        </div>
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-muted text-accent">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

export function SearchInput({
  id,
  value,
  onChange,
  placeholder = 'Search…',
  className,
  icon,
}: {
  id?: string
  value: string
  onChange: ((v: string) => void) | ((e: React.ChangeEvent<HTMLInputElement>) => void)
  placeholder?: string
  className?: string
  icon?: ReactNode
}) {
  return (
    <div className={clsx('relative', className)}>
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
      )}
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => {
          const fn = onChange as (arg: string | React.ChangeEvent<HTMLInputElement>) => void
          // support both (string) and (event) handlers
          if (onChange.length <= 1) {
            try {
              fn(e.target.value)
            } catch {
              fn(e)
            }
          } else {
            fn(e)
          }
        }}
        placeholder={placeholder}
        className={clsx(
          'w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm outline-none',
          'focus:border-accent focus:ring-2 focus:ring-accent/20',
          icon ? 'pl-10 pr-4' : 'px-4',
        )}
      />
    </div>
  )
}
