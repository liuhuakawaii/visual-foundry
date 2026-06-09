import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#476653] text-white hover:bg-[#385342] focus-visible:outline-[#476653]',
  secondary:
    'border border-stone-900/10 bg-white/76 text-stone-900 hover:bg-white focus-visible:outline-[#476653]',
  ghost: 'text-stone-700 hover:bg-stone-950/5 focus-visible:outline-[#476653]',
  danger:
    'border border-rose-900/15 bg-rose-50 text-rose-800 hover:bg-rose-100 focus-visible:outline-rose-700',
}

export function Button({
  variant = 'secondary',
  icon,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition duration-200',
        'active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
