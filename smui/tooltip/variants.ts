import { tv, VariantProps } from "../utils"

export type TooltipVariantProps = VariantProps<typeof tooltipVariants>
export const tooltipVariants = tv({
  base: [],
  variants: {
    variant: {
      default: [],
    },
  },
  defaultVariants: {
    variant: "default",
  },
})
