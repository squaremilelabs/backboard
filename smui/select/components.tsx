"use client"

import React from "react"
import {
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  SelectRenderProps as AriaSelectRenderProps,
  Button as AriaButton,
  ButtonProps as AriaButtonProps,
  ButtonRenderProps as AriaButtonRenderProps,
  SelectValue as AriaSelectValue,
  SelectValueRenderProps as AriaSelectValueRenderProps,
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps,
} from "react-aria-components"
import { ChevronsUpDownIcon } from "lucide-react"
import { cn, DeepPartial, ClassValue, WithDefaultChildren } from "../utils"
import { FieldClassNames, fieldVariants as getFieldVariants } from "../field/variants"
import { popoverVariants } from "../popover/variants"
import { SelectVariantProps, SelectClassNames, selectVariants } from "./variants"

// Replace if not using lucide-react
const SelectButtonIcon = ChevronsUpDownIcon

type SelectRenderProps = WithDefaultChildren<AriaSelectRenderProps>
export type SelectProps = Omit<AriaSelectProps, "children" | "className"> & {
  variants?: SelectVariantProps
  classNames?: DeepPartial<SelectClassNames & { field: FieldClassNames }>
  children: (
    renderProps: SelectRenderProps,
    classNames: Omit<SelectClassNames, "base"> & {
      field: Omit<FieldClassNames, "base">
    }
  ) => React.ReactNode
}

export type SelectButtonRenderProps<T extends object> = WithDefaultChildren<
  AriaSelectValueRenderProps<T>
> &
  AriaButtonRenderProps

export type SelectButtonProps<T extends object> = Omit<
  AriaButtonProps,
  "children" | "className"
> & {
  classNames: SelectClassNames["button"]
  children?: (renderProps: SelectButtonRenderProps<T>) => React.ReactNode
}

export type SelectPopoverProps = Omit<AriaPopoverProps, "className"> & {
  className: ClassValue
}

// # Components -----------------------------------------------------------------------------------

export function Select({ variants, classNames, children, ...props }: SelectProps) {
  const {
    base: baseStyles,
    button: buttonStyles,
    buttonValue: buttonValueStyles,
    buttonIcon: buttonIconStyles,
  } = selectVariants(variants)

  const {
    base: fieldBaseStyles,
    label: fieldLabelStyles,
    inputBox: fieldInputBoxStyles,
    description: fieldDescriptionStyles,
    error: fieldErrorStyles,
  } = getFieldVariants(variants?.field)

  const { popover: popoverStyles } = popoverVariants(variants?.popover)

  const baseClassName = cn(
    baseStyles({ className: classNames?.base }),
    // apply field base styles only if fieldVariants are provided
    variants?.field && fieldBaseStyles({ className: classNames?.field?.base })
  )

  const childrenClassNames = {
    popover: popoverStyles({ className: classNames?.popover }),
    button: {
      base: buttonStyles({ className: classNames?.button?.base }),
      value: buttonValueStyles({ className: classNames?.button?.value }),
      icon: buttonIconStyles({ className: classNames?.button?.icon }),
    },
    field: {
      label: fieldLabelStyles({ className: classNames?.field?.label }),
      inputBox: fieldInputBoxStyles({ className: classNames?.field?.inputBox }),
      description: fieldDescriptionStyles({ className: classNames?.field?.description }),
      error: fieldErrorStyles({ className: classNames?.field?.error }),
    },
  }

  return (
    <AriaSelect {...props} className={baseClassName}>
      {(renderProps) => children(renderProps, childrenClassNames)}
    </AriaSelect>
  )
}

export function SelectButton<T extends object>({
  classNames,
  children,
  ...props
}: SelectButtonProps<T>) {
  return (
    <AriaButton {...props} className={cn(classNames.base)}>
      {(buttonRenderProps) => (
        <>
          <AriaSelectValue<T> className={cn(classNames.value)}>
            {(selectValueRenderProps) => {
              if (children) return children({ ...selectValueRenderProps, ...buttonRenderProps })
              return selectValueRenderProps.defaultChildren
            }}
          </AriaSelectValue>
          <SelectButtonIcon className={cn(classNames.icon)} />
        </>
      )}
    </AriaButton>
  )
}

export function SelectPopover({ className, ...props }: SelectPopoverProps) {
  return <AriaPopover {...props} className={cn(className)} />
}
