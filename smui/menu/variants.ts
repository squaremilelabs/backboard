import { ClassValue, tv, VariantProps } from "../utils"
import { PopoverVariantProps } from "../popover/variants"

// # Variants -------------------------------------------------------------------------------------

type BaseMenuVariantProps = VariantProps<typeof menuVariants>
export type MenuVariantProps = BaseMenuVariantProps & { popover?: PopoverVariantProps }

export const menuVariants = tv({
  slots: {
    // <Menu />
    base: [],
    // <MenuItem />
    item: [],
    // <MenuSection />
    section: [],
    // <MenuSection /> ... <AriaHeader />
    sectionHeader: [],
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

export type MenuClassNames = {
  // slots.base
  base: ClassValue
  // passed to AriaPopover after poopverVariants are applied
  popover: ClassValue
  // slots.item
  item: ClassValue
  section: {
    // slots.section
    base: ClassValue
    // slots.sectionHeader
    header: ClassValue
  }
}
