import { ClassValue, tv, VariantProps } from "../../utils/ui-utils"
import { FieldVariantProps } from "../field/variants"
import { PopoverVariantProps } from "../popover/variants"

type BaseSelectVariantProps = VariantProps<typeof selectVariants>
export type SelectVariantProps = BaseSelectVariantProps & {
  field?: FieldVariantProps
  popover?: PopoverVariantProps
}

export const selectVariants = tv({
  slots: {
    // <Select />
    base: [],
    // <SelectButton />
    button: ["flex items-center gap-4", "cursor-pointer hover:opacity-70"],
    // <SelectButton /> ... <AriaSelectValue />
    buttonValue: ["grow"],
    // <SelectButton /> ... <SelectButtonIcon />
    buttonIcon: ["size-14 text-neutral-muted-text"],
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

// # ClassNames -----------------------------------------------------------------------------------

export type SelectClassNames = {
  // slots.base
  base: ClassValue
  // passed to AriaPopover after popoverVariants are applied
  popover: ClassValue
  // SelectButton slots
  button: {
    // slots.button
    base: ClassValue
    // slots.buttonValue
    value: ClassValue
    // slots.buttonIcon
    icon: ClassValue
  }
}
