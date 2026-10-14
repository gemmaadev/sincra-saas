import { Input } from '../input'

interface DateRangeFilterProps {
  dateFrom: string
  dateTo: string
  isDateRangeInvalid: boolean
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
}

export function DateRangeFilter({
  dateFrom,
  dateTo,
  isDateRangeInvalid,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterProps) {
  return (
    <>
      <div className="w-44">
        <Input
          label="Desde"
          type="date"
          size="sm"
          max={dateTo || undefined}
          value={dateFrom}
          onChange={(event) => onDateFromChange(event.target.value)}
        />
      </div>
      <div className="w-44">
        <Input
          label="Hasta"
          type="date"
          size="sm"
          min={dateFrom || undefined}
          error={isDateRangeInvalid ? 'Debe ser posterior a la fecha inicial' : undefined}
          value={dateTo}
          onChange={(event) => onDateToChange(event.target.value)}
        />
      </div>
    </>
  )
}
