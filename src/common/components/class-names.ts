import { tv, VariantProps } from "~/smui/utils"

export const label = tv({
  base: ["text-sm text-neutral-muted-text uppercase", "min-w-fit tracking-wider font-semibold"],
})

export const panel = tv({
  slots: {
    base: [
      "flex flex-col w-full max-w-full",
      "bg-neutral-muted-bg",
      "border border-neutral-muted-border",
      "p-4 rounded-sm gap-4",
    ],
    section: ["bg-base-bg/50 rounded-sm", "flex items-center p-4"],
  },
})

export type PaletteVariant = VariantProps<typeof palette>["p"]
export const palette = tv({
  base: [],
  variants: {
    p: {
      "base-solid": "bg-base-bg text-base-text border-base-border",
      "base-flat": "text-base-text border-base-border",
      "primary-solid": "bg-primary-bg text-primary-fg border-primary-border",
      "primary-flat": "text-primary-text border-primary-muted-border",
      "primary-muted-solid":
        "bg-primary-muted-bg text-primary-muted-fg border-primary-muted-border",
      "primary-muted-flat": "text-primary-muted-text border-primary-muted-border",
      "neutral-solid": "bg-neutral-bg text-neutral-fg border-neutral-border",
      "neutral-flat": "text-neutral-text border-neutral-muted-border",
      "neutral-muted-solid":
        "bg-neutral-muted-bg text-neutral-muted-fg border-neutral-muted-border",
      "neutral-muted-flat": "text-neutral-muted-text border-neutral-muted-border",
      "danger-solid": "bg-danger-bg text-danger-fg border-danger-border",
      "danger-flat": "text-danger-text border-danger-muted-border",
      "danger-muted-solid": "bg-danger-muted-bg text-danger-muted-fg border-danger-muted-border",
      "danger-muted-flat": "text-danger-muted-text border-danger-muted-border",
    },
  },
})
