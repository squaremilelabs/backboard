"use client"

import {
  Tooltip as AriaTooltip,
  TooltipProps as AriaTooltipProps,
  TooltipRenderProps as AriaTooltipRenderProps,
  TooltipTrigger as AriaTooltipTrigger,
  TooltipTriggerComponentProps as AriaTooltipTriggerComponentProps,
} from "react-aria-components"
import { ClassValue, WithDefaultChildren } from "../utils"
import { TooltipVariantProps, tooltipVariants } from "./variants"

export type TooltipRenderProps = WithDefaultChildren<AriaTooltipRenderProps>
export type TooltipProps = Omit<AriaTooltipProps, "className"> & {
  variants?: TooltipVariantProps
  className?: ClassValue
}

export type TooltipTriggerProps = AriaTooltipTriggerComponentProps

// # Components -----------------------------------------------------------------------------------

export function Tooltip({ variants, className, ...props }: TooltipProps) {
  return <AriaTooltip {...props} className={tooltipVariants({ ...variants, className })} />
}

export const TooltipTrigger = AriaTooltipTrigger
