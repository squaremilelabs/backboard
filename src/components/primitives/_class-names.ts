import { twv } from "@/lib/tailwind"

export const countBadge = twv({
  base: [
    "flex items-center justify-center",
    "shrink-0",
    "h-content-sm w-content-md rounded-sm",
    "font-bold text-xs",
    "overflow-hidden",
    "border border-transparent",
  ],
  variants: {
    color: {
      primary: "bg-primary-bg text-primary-fg",
      neutral: "bg-neutral-bg text-neutral-fg",
    },
    appearance: {
      fill: "", // default
      outline: "border bg-transparent",
      flat: "bg-transparent w-fit",
    },
  },
  compoundVariants: [
    { color: "primary", appearance: "flat", class: "text-primary-text" },
    { color: "neutral", appearance: "flat", class: "text-neutral-text" },
    {
      color: "primary",
      appearance: "outline",
      class: "text-primary-text border-primary-muted-border",
    },
    {
      color: "neutral",
      appearance: "outline",
      class: "text-neutral-text border-neutral-muted-border",
    },
  ],
  defaultVariants: {
    color: "primary",
    appearance: "fill",
  },
})

export const iconButton = twv({
  base: [
    "flex items-center justify-center",
    "shrink-0",
    "text-neutral-muted-text",
    "disabled:opacity-50",
    "not-data-disabled:hover:text-base-text",
  ],
  variants: {
    size: {
      default: "size-box-md rounded-md",
      sm: "size-box-sm rounded-sm",
    },
    hoverColor: {
      base: "not-data-disabled:hover:bg-base-bg/70",
      neutral: "not-data-disabled:hover:bg-neutral-muted-bg/70",
    },
  },
  defaultVariants: {
    size: "default",
    hoverColor: "base",
  },
})

export const actionMenu = twv({
  slots: {
    base: [],
    item: [],
    keyboard: [],
    separator: [],
  },
})

export const tooltip = twv({
  base: [
    "gap-space-md flex flex-col",
    "bg-neutral-bg text-neutral-fg text-sm",
    "p-space-md",
    "rounded-md",
  ],
})
