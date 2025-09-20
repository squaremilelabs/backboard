import { useEffect, useState } from "react"
import { useDebounceCallback } from "usehooks-ts"

export function useDebouncedTypings<T>(initialValue: T, delay: number = 500) {
  const [typedValue, setTypedValue] = useState<T>(initialValue)
  const [settledValue, setSettledValue] = useState<T>(initialValue)
  const debouncedSetValue = useDebounceCallback(setSettledValue, delay)

  useEffect(() => {
    debouncedSetValue(typedValue)
  }, [typedValue, debouncedSetValue])

  return {
    typedValue,
    setTypedValue,
    settledValue,
  }
}
