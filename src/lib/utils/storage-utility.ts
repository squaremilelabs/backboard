import { useEffect, useState } from "react"
import { useLocalStorage, useSessionStorage } from "usehooks-ts"

export function useSessionStorageUtility<T>(key: string, initialValue: T) {
  const [stateValue, setStateValue] = useState(initialValue)
  const [sessionValue, setSessionValue] = useSessionStorage(key, initialValue)
  useEffect(() => setStateValue(sessionValue), [sessionValue])
  return [stateValue, setSessionValue] as const
}

export function useLocalStorageUtility<T>(key: string, initialValue: T) {
  const [stateValue, setStateValue] = useState(initialValue)
  const [localValue, setLocalValue] = useLocalStorage(key, initialValue)
  useEffect(() => setStateValue(localValue), [localValue])
  return [stateValue, setLocalValue] as const
}
