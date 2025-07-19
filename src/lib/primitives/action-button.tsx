import { VariantProps } from "tailwind-variants"
import { twv } from "../utils/tailwind"

export const actionButtonVariants = twv({
  base: [
    "flex items-center min-w-fit min-h-36 min-w-36 p-8 gap-8",
    "not-disabled:cursor-pointer not-disabled:hover:opacity-70",
  ],
  variants: {
    color: {
      "neutral": "text-neutral-700 bg-neutral-100 border-neutral-200",
      "red": "text-red-700 bg-red-50 border-red-200",
      "yellow": "text-yellow-600 bg-yellow-100 border-yellow-200",
      "purple": "text-purple-600 bg-purple-100 border-purple-200",
      "blue": "text-blue-600 bg-blue-100 border-blue-200",
      "neutral-light": "text-neutral-400 bg-neutral-100 border-neutral-200",
    },
    transparent: { true: "bg-transparent" },
    bordered: { true: "border" },
  },
  defaultVariants: {
    color: "neutral",
    transparent: false,
    bordered: false,
  },
})

export type ActionButtonVariants = VariantProps<typeof actionButtonVariants>
