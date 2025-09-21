import { ClassValue, tv, VariantProps } from "../utils"

export type PopoverVariantProps = VariantProps<typeof popoverVariants>
export const popoverVariants = tv({
  slots: {
    // <AriaPopover />
    popover: [],
    // <AriaDialog />
    content: [],
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

export type PopoverClassNames = {
  // slots.popover
  popover: ClassValue
  // slots.content
  content: ClassValue
}
