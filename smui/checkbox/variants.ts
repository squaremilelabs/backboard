"use client"
import { ClassValue, tv, VariantProps } from "../utils"
import { FieldVariantProps } from "../field/variants"

type BaseCheckboxVariantProps = VariantProps<typeof checkboxVariants>
export type CheckboxVariantProps = BaseCheckboxVariantProps & {
  field?: FieldVariantProps
}

export const checkboxVariants = tv({
  slots: {
    // <CheckboxGroup />
    group: [],
    // <Checkbox />
    checkboxBase: [],
    // <Checkbox /> ... <Icon />
    checkboxIcon: [],
    // <Checkbox /> ... <span />
    checkboxLabel: [],
  },
  variants: {
    variant: {
      "default": {
        checkboxBase: ["size-20 flex items-center justify-center cursor-pointer"],
        checkboxIcon: ["size-16"],
      },
      "with-label": {
        checkboxBase: ["flex items-center gap-4 cursor-pointer"],
        checkboxIcon: ["size-16"],
        checkboxLabel: [""],
      },
      "reset": {},
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export type CheckboxClassNames = {
  // slots.checkboxBase
  base: ClassValue
  // slots.checkboxIcon
  icon: ClassValue
  // slots.checkboxLabel
  label: ClassValue
}

export type CheckboxGroupClassNames = {
  // slots.group
  base: ClassValue
  // Checkbox slots
  checkbox: CheckboxClassNames
}
