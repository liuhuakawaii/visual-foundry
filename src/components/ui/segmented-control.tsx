import { cn } from '../../lib/cn'

interface SegmentOption<TValue extends string> {
  label: string
  value: TValue
}

interface SegmentedControlProps<TValue extends string> {
  value: TValue
  options: SegmentOption<TValue>[]
  onChange: (value: TValue) => void
}

export function SegmentedControl<TValue extends string>({
  value,
  options,
  onChange,
}: SegmentedControlProps<TValue>) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-md border border-stone-900/10 bg-stone-100 p-1">
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-9 rounded px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#476653]',
            value === option.value
              ? 'bg-white text-stone-950 shadow-[0_10px_30px_-24px_rgba(60,44,31,0.75)]'
              : 'text-stone-500 hover:text-stone-900',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
