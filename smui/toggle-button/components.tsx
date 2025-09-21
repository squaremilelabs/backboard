"use client"

import React from "react"
import {
  ToggleButton as AriaToggleButton,
  ToggleButtonProps as AriaToggleButtonProps,
  ToggleButtonRenderProps as AriaToggleButtonRenderProps,
  ToggleButtonGroup as AriaToggleButtonGroup,
  ToggleButtonGroupProps as AriaToggleButtonGroupProps,
  ToggleButtonGroupRenderProps as AriaToggleButtonGroupRenderProps,
} from "react-aria-components"
import { WithDefaultChildren, ClassValue } from "../utils"
import { ButtonGroupClassNames, buttonVariants, ButtonVariantProps } from "../button/variants"

export type ToggleButtonRenderProps = WithDefaultChildren<AriaToggleButtonRenderProps>
export type ToggleButtonProps = Omit<AriaToggleButtonProps, "className"> & {
  variants?: ButtonVariantProps
  className?: ClassValue
}

export type ToggleButtonGroupRenderProps = WithDefaultChildren<AriaToggleButtonGroupRenderProps>
export type ToggleButtonGroupProps = Omit<AriaToggleButtonGroupProps, "className" | "children"> & {
  variants?: ButtonVariantProps
  classNames?: Partial<ButtonGroupClassNames>
  children: (
    renderProps: ToggleButtonGroupRenderProps,
    classNames: Omit<ButtonGroupClassNames, "base">
  ) => React.ReactNode
}

// # Components -----------------------------------------------------------------------------------

export function ToggleButton({ variants, className, ...props }: ToggleButtonProps) {
  const { button: buttonStyles } = buttonVariants(variants)
  return <AriaToggleButton {...props} className={buttonStyles({ className })} />
}

export function ToggleButtonGroup({
  variants,
  classNames,
  children,
  ...props
}: ToggleButtonGroupProps) {
  const { group: groupStyles, button: buttonStyles } = buttonVariants(variants)

  const childrenClassNames = {
    button: buttonStyles({ className: classNames?.button }),
  }

  return (
    <AriaToggleButtonGroup {...props} className={groupStyles({ className: classNames?.base })}>
      {(renderProps) => children(renderProps, childrenClassNames)}
    </AriaToggleButtonGroup>
  )
}
