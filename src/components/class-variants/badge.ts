import { twv } from "@/core/lib/tailwind"

export const badgeVariants = twv({
  base: ["text-xs leading-(--text-xs) font-bold", "px-space-md py-space-sm rounded-full border"],
  variants: {
    color: {
      primary: "",
      neutral: "",
    },
    type: {
      solid: "",
      outline: "",
    },
  },
  compoundVariants: [
    {
      color: "primary",
      type: "solid",
      class: ["bg-primary-bg text-primary-fg border-transparent"],
    },
    {
      color: "primary",
      type: "outline",
      class: ["bg-transparent text-primary-text"],
    },
    {
      color: "neutral",
      type: "solid",
      class: ["bg-neutral-bg text-neutral-fg border-transparent"],
    },
    {
      color: "neutral",
      type: "outline",
      class: ["bg-transparent text-neutral-text"],
    },
  ],
  defaultVariants: {
    type: "solid",
    color: "primary",
  },
})
