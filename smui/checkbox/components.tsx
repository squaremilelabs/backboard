"use client"

import {
  Checkbox as AriaCheckbox,
  CheckboxProps as AriaCheckboxProps,
  CheckboxRenderProps as AriaCheckboxRenderProps,
  CheckboxGroup as AriaCheckboxGroup,
  CheckboxGroupProps as AriaCheckboxGroupProps,
  CheckboxGroupRenderProps as AriaCheckboxGroupRenderProps,
} from "react-aria-components"
import { SquareCheckIcon, SquareIcon, SquareMinusIcon } from "lucide-react"
import { cn, DeepPartial, renderChildren, WithDefaultChildren } from "../utils"
import { FieldClassNames, fieldVariants } from "../field/variants"
import {
  CheckboxVariantProps,
  CheckboxClassNames,
  CheckboxGroupClassNames,
  checkboxVariants,
} from "./variants"

// Replace if not using lucide-react
const IndeterminateIcon = SquareMinusIcon
const CheckedIcon = SquareCheckIcon
const UncheckedIcon = SquareIcon

export type CheckboxRenderProps = WithDefaultChildren<AriaCheckboxRenderProps>
export type CheckboxProps = Omit<AriaCheckboxProps, "className"> & {
  variants?: CheckboxVariantProps
  classNames?: DeepPartial<CheckboxClassNames>
}

export type CheckboxGroupRenderProps = WithDefaultChildren<AriaCheckboxGroupRenderProps>
export type CheckboxGroupProps = Omit<AriaCheckboxGroupProps, "children" | "className"> & {
  variants?: CheckboxVariantProps
  classNames?: DeepPartial<CheckboxGroupClassNames & { field: FieldClassNames }>
  children: (
    renderProps: CheckboxGroupRenderProps,
    classNames: Omit<CheckboxGroupClassNames, "base"> & { field: Omit<FieldClassNames, "base"> }
  ) => React.ReactNode
}

// # Components -----------------------------------------------------------------------------------

export function Checkbox({ variants, classNames, children, ...props }: CheckboxProps) {
  const {
    checkboxBase: baseStyles,
    checkboxIcon: iconStyles,
    checkboxLabel: labelStyles,
  } = checkboxVariants(variants)
  return (
    <AriaCheckbox {...props} className={baseStyles({ className: classNames?.base })}>
      {(renderProps) => (
        <>
          {renderProps.isIndeterminate ? (
            <IndeterminateIcon className={iconStyles({ className: classNames?.icon })} />
          ) : renderProps.isSelected ? (
            <CheckedIcon className={iconStyles({ className: classNames?.icon })} />
          ) : (
            <UncheckedIcon className={iconStyles({ className: classNames?.icon })} />
          )}
          <span className={labelStyles({ className: classNames?.label })}>
            {renderChildren(children, renderProps)}
          </span>
        </>
      )}
    </AriaCheckbox>
  )
}

export function CheckboxGroup({ variants, classNames, children, ...props }: CheckboxGroupProps) {
  const {
    group: baseStyles,
    checkboxBase: checkboxBaseStyles,
    checkboxIcon: checkboxIconStyles,
    checkboxLabel: checkboxLabelStyles,
  } = checkboxVariants(variants)

  const {
    base: fieldBaseStyles,
    label: fieldLabelStyles,
    inputBox: fieldInputBoxStyles,
    description: fieldDescriptionStyles,
    error: fieldErrorStyles,
  } = fieldVariants(variants?.field)

  const baseClassName = cn(
    baseStyles({ className: classNames?.base }),
    // apply field base styles only if fieldVariants are provided
    variants?.field && fieldBaseStyles({ className: classNames?.field?.base })
  )

  const childrenClassNames = {
    checkbox: {
      base: checkboxBaseStyles({ className: classNames?.checkbox?.base }),
      icon: checkboxIconStyles({ className: classNames?.checkbox?.icon }),
      label: checkboxLabelStyles({ className: classNames?.checkbox?.label }),
    },
    field: {
      label: fieldLabelStyles({ className: classNames?.field?.label }),
      inputBox: fieldInputBoxStyles({ className: classNames?.field?.inputBox }),
      description: fieldDescriptionStyles({ className: classNames?.field?.description }),
      error: fieldErrorStyles({ className: classNames?.field?.error }),
    },
  }

  return (
    <AriaCheckboxGroup {...props} className={baseClassName}>
      {(renderProps) => children(renderProps, childrenClassNames)}
    </AriaCheckboxGroup>
  )
}
