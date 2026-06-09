import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  helper?: string
  error?: string
  children: ReactNode
}

export function Field({ label, helper, error, children }: FieldProps) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-stone-900">{label}</span>
      {children}
      {helper && !error ? <span className="text-xs leading-5 text-stone-500">{helper}</span> : null}
      {error ? <span className="text-xs leading-5 text-rose-700">{error}</span> : null}
    </div>
  )
}
