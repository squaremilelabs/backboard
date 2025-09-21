import { ClassValue, tv, VariantProps } from "../utils"

export type ListBoxVariantProps = VariantProps<typeof listBoxVariants>
export const listBoxVariants = tv({
  slots: {
    // <ListBox />
    base: [],
    // <ListBoxItem />
    item: [],
    // <ListBoxSection />
    section: [],
    // <ListBoxSection /> ... <Header />
    sectionHeader: [],
  },
  variants: {
    variant: {
      default: {},
      flat: {
        base: ["flex flex-col gap-2"],
        item: [
          "group/list-box-item",
          "flex items-center gap-4 px-8 py-6",
          "cursor-pointer",
          "rounded-sm",
          "hover:bg-neutral-muted-bg/50",
          "data-drop-target:outline-2",
          "data-selected:bg-neutral-muted-bg",
        ],
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export type ListBoxClassNames = {
  // slots.base
  base: ClassValue
  // slots.item
  item: ClassValue
  section: {
    // slots.section
    base: ClassValue
    // slots.sectionHeader
    header: ClassValue
  }
}
