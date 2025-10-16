"use client"

import { useEffect, useState } from "react"

export function useIsMobile(options?: { debugValue?: boolean }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Runs only on client
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent || ""
      const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      setIsMobile(mobileRegex.test(ua))
    }
  }, [])

  // For dev purposes, allow overriding the value
  if (options?.debugValue !== undefined) {
    return options.debugValue
  }
  return isMobile
}
