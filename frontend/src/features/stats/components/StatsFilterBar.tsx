import { DateRangeFilter } from '@/shared/components'

interface StatsFilterBarProps {
  dateFrom: string
  dateTo: string
  isDateRangeInvalid: boolean
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
}

export function StatsFilterBar({
  dateFrom,
  dateTo,
  isDateRangeInvalid,
  onDateFromChange,
  onDateToChange,
}: StatsFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <DateRangeFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        isDateRangeInvalid={isDateRangeInvalid}
        onDateFromChange={onDateFromChange}
        onDateToChange={onDateToChange}
      />
    </div>
  )
}
