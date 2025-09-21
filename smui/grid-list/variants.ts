import { tv, ClassValue, VariantProps } from "../utils"

export type GridListVariantProps = VariantProps<typeof gridListVariants>
export const gridListVariants = tv({
  slots: {
    // <GridList />
    base: ["flex flex-col"],
    // <GridListItem />
    item: ["flex"],
  },
  variants: {
    variant: {
      "default": {},
      "task-list": {
        base: [
          "flex flex-col",
          "gap-2",
          "max-h-full min-h-0 grow overflow-auto",
          "overscroll-contain",
        ],
        item: [
          "group/grid-list-item",
          "flex items-center",
          "bg-base-bg rounded-sm",
          "gap-8 p-8 !outline-0",
          "hover:bg-base-bg/70",
          "focus-visible:border-l-4 focus-visible:border-l-base-outline",
          "data-selected:border-l-4 data-selected:border-l-base-outline",
        ],
      },
      "nav-list": {
        base: ["flex flex-col gap-2"],
        item: [
          "group/grid-list-item",
          "flex items-center gap-4 px-8 py-6",
          "cursor-pointer",
          "rounded-sm",
          "hover:bg-neutral-muted-bg/50",
          "data-drop-target:outline-2",
        ],
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export type GridListClassNames = {
  // slots.base
  base: ClassValue
  // slots.item
  item: ClassValue
}
