"use client"
import { tv, VariantProps, ClassValue } from "../utils"

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
export const buttonVariants = tv({
  slots: {
    // <ButtonGroup />
    group: ["flex items-center"],
    // <Button />
    button: ["not-disabled:cursor-pointer"],
  },
  variants: {
    variant: {
      "default": {},
      "action-button": {
        button: ["flex items-center px-8 py-4 gap-4 text-sm rounded-sm"],
      },
      "action-button-icon": {
        button: ["flex items-center rounded-sm"],
      },
    },
    hover: {
      fade: { button: ["not-disabled:hover:opacity-70"] },
      fill: { button: ["not-disabled:hover:bg-neutral-muted-bg/50"] },
      underline: { button: ["not-disabled:hover:underline"] },
      none: {},
    },
  },
  defaultVariants: {
    variant: "default",
    hover: "fade",
  },
})

export type ButtonGroupClassNames = {
  // slots.group
  base: ClassValue
  // slots.button
  button: ClassValue
}
