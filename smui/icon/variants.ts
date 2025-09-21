import { tv, VariantProps } from "../utils"

export type IconVariantProps = VariantProps<typeof iconVariants>
export const iconVariants = tv({
  base: ["flex items-center justify-center"],
  variants: {
    size: {
      sm: "size-16 min-w-16 min-h-16 [&_svg]:!size-12 [&_img]:!size-12",
      md: "size-20 min-w-20 min-h-20 [&_svg]:!size-16 [&_img]:!size-16",
      lg: "size-24 min-w-24 min-h-24 [&_svg]:!size-20 [&_img]:!size-20",
    },
  },
  defaultVariants: {
    size: "md",
  },
})
