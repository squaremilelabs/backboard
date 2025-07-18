import {
  ArchiveIcon,
  ChevronDownIcon,
  ChevronsDownIcon,
  CircleArrowOutUpLeftIcon,
  CircleCheckBigIcon,
  Clock4Icon,
  ClockFadingIcon,
  CrosshairIcon,
  GripVerticalIcon,
  LoaderIcon,
  LucideIcon,
  LucideProps,
  MenuIcon,
  PlusIcon,
  XIcon,
} from "lucide-react"
import { VariantProps } from "tailwind-variants"
import { twv } from "../utils/tailwind"

export type IconKey =
  | "drag-handle"
  | "plus"
  | "archive"
  | "due"
  | "defer"
  | "defer_fade"
  | "complete"
  | "return"
  | "loader"
  | "x"
  | "menu"
  | "double-chevron"
  | "chevron"

const ICON_MAP: Record<IconKey, LucideIcon> = {
  "drag-handle": GripVerticalIcon,
  "plus": PlusIcon,
  "archive": ArchiveIcon,
  "due": CrosshairIcon,
  "defer": Clock4Icon,
  "defer_fade": ClockFadingIcon,
  "complete": CircleCheckBigIcon,
  "return": CircleArrowOutUpLeftIcon,
  "loader": LoaderIcon,
  "x": XIcon,
  "menu": MenuIcon,
  "chevron": ChevronDownIcon,
  "double-chevron": ChevronsDownIcon,
}

export const iconVariants = twv({
  base: "",
  variants: {
    size: {
      sm: "size-16 max-w-16 max-h-16 min-w-16 min-h-16",
      md: "size-20 max-w-20 max-h-20 min-w-20 min-h-20",
      lg: "size-24 max-w-24 max-h-24 min-w-24 min-h-24",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export type IconVariants = VariantProps<typeof iconVariants>

export function Icon({
  icon,
  size,
  className,
  ...props
}: { icon: IconKey } & LucideProps & IconVariants) {
  const LucideIcon = ICON_MAP[icon]
  return <LucideIcon {...props} className={iconVariants({ size, className })} />
}
