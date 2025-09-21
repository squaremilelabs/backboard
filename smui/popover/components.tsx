"use client"

import React from "react"
import {
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps,
  PopoverRenderProps as AriaPopoverRenderProps,
  Dialog as AriaDialog,
  DialogRenderProps as AriaDialogRenderProps,
  DialogTrigger as AriaDialogTrigger,
  DialogTriggerProps as AriaDialogTriggerProps,
} from "react-aria-components"
import { renderChildren, WithDefaultChildren } from "../utils"
import { PopoverVariantProps, PopoverClassNames, popoverVariants } from "./variants"

export type PopoverRenderProps = WithDefaultChildren<AriaPopoverRenderProps> & AriaDialogRenderProps
export type PopoverProps = Omit<AriaPopoverProps, "children" | "className"> & {
  variants?: PopoverVariantProps
  classNames?: Partial<PopoverClassNames>
  children: React.ReactNode | ((renderProps: PopoverRenderProps) => React.ReactNode)
}

export type PopoverTriggerProps = AriaDialogTriggerProps

export function Popover({ children, classNames, variants, ...props }: PopoverProps) {
  const { popover: popoverStyles, content: contentStyles } = popoverVariants(variants)
  return (
    <AriaPopover {...props} className={popoverStyles({ className: classNames?.popover })}>
      {(popoverRenderProps) => (
        <AriaDialog className={contentStyles({ className: classNames?.content })}>
          {(dialogRenderProps) =>
            renderChildren(children, { ...popoverRenderProps, ...dialogRenderProps })
          }
        </AriaDialog>
      )}
    </AriaPopover>
  )
}

export const PopoverTrigger = AriaDialogTrigger
