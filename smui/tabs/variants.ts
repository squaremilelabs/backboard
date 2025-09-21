import { ClassValue, tv, VariantProps } from "../utils"

export type TabsVariantProps = VariantProps<typeof tabsVariants>
export const tabsVariants = tv({
  slots: {
    // <Tabs />
    base: [],
    // <Tabs /> ... <AriaTabList />
    tabList: [],
    // <Tab />
    tab: [],
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

export type TabsClassNames = {
  // slots.base
  base: ClassValue
  // slots.tabList
  tabList: ClassValue
  // slots.tab
  tab: ClassValue
}
