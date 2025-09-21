import { tv, VariantProps, ClassValue } from "../utils"
import { FieldVariantProps } from "../field/variants"

type BaseTextFieldVariantProps = VariantProps<typeof textFieldVariants>
export type TextFieldVariantProps = BaseTextFieldVariantProps & {
  field?: FieldVariantProps
}
export const textFieldVariants = tv({
  slots: {
    // <TextField />
    base: [],
    // <TextFieldInput />
    input: [],
    // <TextFieldTextArea />
    textarea: ["resize-none"],
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

export type TextFieldClassNames = {
  // slots.base
  base: ClassValue
  // slots.input
  input: ClassValue
  // slots.textarea
  textarea: ClassValue
}
