"use client"

import { tv, VariantProps, ClassValue } from "../utils"

export type FieldVariantProps = VariantProps<typeof fieldVariants>
export const fieldVariants = tv({
  slots: {
    // To be appended to the base field component (e.g., <Select />, <TextField />, etc.)
    base: [],
    // To be appended to the field input component (e.g., <SelectButton />, <TextFieldInput />, etc.)
    inputBox: [],
    // <FieldLabel />
    label: [],
    // <FieldDescription />
    description: [],
    // <FieldError />
    error: [],
  },
  variants: {
    variant: {
      default: {},
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export type FieldClassNames = {
  // slots.base
  base: ClassValue
  // slots.label
  label: ClassValue
  // slots.inputBox
  inputBox: ClassValue
  // slots.description
  description: ClassValue
  // slots.error
  error: ClassValue
}
