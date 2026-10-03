import { cn } from '@renderer/lib/format'
import type { Diet, TableStatus } from '@shared/models'
import { ComponentProps, ReactNode } from 'react'
import { LuMinus, LuPlus } from 'react-icons/lu'

/** FSSAI-style veg / non-veg / egg mark: coloured square with a dot (or triangle). */
export const DietMark = ({ diet, className }: { diet: Diet; className?: string }) => {
  const color = diet === 'veg' ? '#1E8E3E' : diet === 'egg' ? '#D9A400' : '#B3261E'
  return (
    <span
      title={diet === 'veg' ? 'Vegetarian' : diet === 'egg' ? 'Contains egg' : 'Non-vegetarian'}
      className={cn(
        'inline-grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[3px] border-[1.5px] bg-white',
        className
      )}
      style={{ borderColor: color }}
    >
      {diet === 'nonveg' ? (
        <svg viewBox="0 0 10 10" className="h-2 w-2">
          <path d="M5 1.2 9 8.6H1z" fill={color} />
        </svg>
      ) : (
        <span className="h-[7px] w-[7px] rounded-full" style={{ background: color }} />
      )}
    </span>
  )
}

export const statusMeta: Record<
  TableStatus,
  { label: string; dot: string; chip: string; tile: string }
> = {
  free: {
    label: 'Available',
    dot: 'bg-herb-500',
    chip: 'bg-herb-50 text-herb-700',
    tile: 'border-line bg-paper'
  },
  occupied: {
    label: 'Dining',
    dot: 'bg-chili-500',
    chip: 'bg-chili-50 text-chili-700',
    tile: 'border-chili-200 bg-chili-50'
  },
  billing: {
    label: 'Bill asked',
    dot: 'bg-saffron-500',
    chip: 'bg-saffron-50 text-saffron-700',
    tile: 'border-saffron-100 bg-saffron-50'
  },
  reserved: {
    label: 'Reserved',
    dot: 'bg-slateblue-500',
    chip: 'bg-slateblue-50 text-slateblue-700',
    tile: 'border-slateblue-100 bg-slateblue-50'
  }
}

export const StatusChip = ({ status, className }: { status: TableStatus; className?: string }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
      statusMeta[status].chip,
      className
    )}
  >
    <span className={cn('h-1.5 w-1.5 rounded-full', statusMeta[status].dot)} />
    {statusMeta[status].label}
  </span>
)

export const Stepper = ({
  value,
  onChange,
  size = 'md'
}: {
  value: number
  onChange: (v: number) => void
  size?: 'md' | 'lg'
}) => {
  const btn = cn(
    'grid place-items-center rounded-xl bg-paper text-ink shadow-card transition active:scale-95 hover:bg-white',
    size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'
  )
  return (
    <div className="flex items-center gap-1 rounded-2xl bg-sand p-1">
      <button className={btn} onClick={() => onChange(value - 1)} aria-label="Decrease">
        <LuMinus className="h-4 w-4" />
      </button>
      <span className="num w-7 text-center text-[15px] font-bold">{value}</span>
      <button className={btn} onClick={() => onChange(value + 1)} aria-label="Increase">
        <LuPlus className="h-4 w-4" />
      </button>
    </div>
  )
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark'
  size?: 'md' | 'lg'
  icon?: ReactNode
}

export const Button = ({
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: ButtonProps) => (
  <button
    {...props}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:opacity-40',
      size === 'lg' ? 'h-14 px-5 text-[15px]' : 'h-11 px-4 text-sm',
      variant === 'primary' && 'bg-chili-600 text-white shadow-pay hover:bg-chili-700',
      variant === 'secondary' && 'border border-line bg-paper text-ink shadow-card hover:bg-white',
      variant === 'ghost' && 'text-ink-2 hover:bg-sand',
      variant === 'dark' && 'bg-espresso text-white hover:bg-espresso-3',
      className
    )}
  >
    {icon}
    {children}
  </button>
)

export const Chip = ({
  active,
  children,
  count,
  className,
  ...props
}: ComponentProps<'button'> & { active?: boolean; count?: number }) => (
  <button
    {...props}
    className={cn(
      'inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition',
      active ? 'bg-espresso text-white' : 'bg-paper text-ink-2 ring-1 ring-line hover:text-ink',
      className
    )}
  >
    {children}
    {count !== undefined && (
      <span
        className={cn(
          'num rounded-full px-1.5 py-0.5 text-[11px] leading-none',
          active ? 'bg-white/15 text-white' : 'bg-sand text-ink-2'
        )}
      >
        {count}
      </span>
    )}
  </button>
)

export const SectionTitle = ({
  title,
  hint,
  action,
  inline
}: {
  title: string
  hint?: ReactNode
  action?: ReactNode
  inline?: boolean
}) => (
  <div
    className={cn('flex justify-between gap-4', inline ? 'mb-3 items-baseline' : 'mb-4 items-end')}
  >
    <div className={cn(inline && 'flex items-baseline gap-2')}>
      <h2 className="font-display text-[17px] font-bold tracking-tight">{title}</h2>
      {hint && <p className={cn('text-[13px] text-ink-3', !inline && 'mt-0.5')}>{hint}</p>}
    </div>
    {action}
  </div>
)
