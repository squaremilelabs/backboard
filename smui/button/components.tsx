"use client"

import React from "react"
import {
  Button as AriaButton,
  ButtonProps as AriaButtonProps,
  ButtonRenderProps as AriaButtonRenderProps,
  Group as AriaGroup,
  GroupProps as AriaGroupProps,
  GroupRenderProps as AriaGroupRenderProps,
} from "react-aria-components"
import { DeepPartial, ClassValue, WithDefaultChildren } from "../utils"
import { buttonVariants, ButtonVariantProps, ButtonGroupClassNames } from "./variants"

export type ButtonRenderProps = AriaButtonRenderProps
export type ButtonProps = Omit<AriaButtonProps, "className"> & {
  forwardRef?: React.Ref<HTMLButtonElement>
  variants?: ButtonVariantProps
  className?: ClassValue
}

export type ButtonGroupRenderProps = AriaGroupRenderProps
export type ButtonGroupProps = Omit<AriaGroupProps, "className" | "children"> & {
  variants?: ButtonVariantProps
  classNames?: DeepPartial<ButtonGroupClassNames>
  children: (
    renderProps: WithDefaultChildren<ButtonGroupRenderProps>,
    classNames: Omit<ButtonGroupClassNames, "base">
  ) => React.ReactNode
}

export function Button({ variants, className, forwardRef, ...props }: ButtonProps) {
  const { button: buttonStyles } = buttonVariants(variants)
  return <AriaButton {...props} ref={forwardRef} className={buttonStyles({ className })} />
}

export function ButtonGroup({ variants, classNames, children, ...props }: ButtonGroupProps) {
  const { group: baseStyles, button: buttonStyles } = buttonVariants(variants)

  const baseClassName = baseStyles({ className: classNames?.base })

  const childrenClassNames = {
    button: buttonStyles({ className: classNames?.button }),
  }

  return (
    <AriaGroup {...props} className={baseClassName}>
      {(renderProps) => children(renderProps, childrenClassNames)}
    </AriaGroup>
  )
}
