"use client"

import React from "react"
import { ClassValue } from "../utils"
import { IconVariantProps, iconVariants } from "./variants"

export type IconProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children" | "className"> & {
  variants?: IconVariantProps
  className?: ClassValue
  icon: React.ReactNode
}

export function Icon({ variants, className, icon }: IconProps) {
  return <span className={iconVariants({ ...variants, className })}>{icon}</span>
}
