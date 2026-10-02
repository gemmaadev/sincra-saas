import { useEffect, useState } from 'react'

export function useDebouncedValue<Value>(value: Value, delayInMilliseconds = 300): Value {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayInMilliseconds)
    return () => clearTimeout(timeoutId)
  }, [value, delayInMilliseconds])

  return debouncedValue
}
