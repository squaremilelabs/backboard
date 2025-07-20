import {
  ArchiveIcon,
  ChevronDownIcon,
  ChevronsDownIcon,
  CircleCheckBigIcon,
  Clock4Icon,
  CrosshairIcon,
  DownloadIcon,
  GripVerticalIcon,
  InboxIcon,
  LoaderIcon,
  LucideIcon,
  LucideProps,
  MenuIcon,
  PlusIcon,
  SquareCheckIcon,
  SquareIcon,
  SquareMinusIcon,
  XIcon,
} from "lucide-react"
import { VariantProps } from "tailwind-variants"
import { tv } from "~/smui/utils"

export type IconKey =
  | "drag-handle"
  | "plus"
  | "archive"
  | "due"
  | "snooze"
  | "complete"
  | "inbox"
  | "return"
  | "loader"
  | "x"
  | "menu"
  | "double-chevron"
  | "chevron"
  | "checkbox-blank"
  | "checkbox-checked"
  | "checkbox-indeterminate"

const ICON_MAP: Record<IconKey, LucideIcon> = {
  "drag-handle": GripVerticalIcon,
  "plus": PlusIcon,
  "archive": ArchiveIcon,
  "due": CrosshairIcon,
  "snooze": Clock4Icon,
  "complete": CircleCheckBigIcon,
  "inbox": InboxIcon,
  "return": DownloadIcon,
  "loader": LoaderIcon,
  "x": XIcon,
  "menu": MenuIcon,
  "chevron": ChevronDownIcon,
  "double-chevron": ChevronsDownIcon,
  "checkbox-blank": SquareIcon,
  "checkbox-checked": SquareCheckIcon,
  "checkbox-indeterminate": SquareMinusIcon,
}

export const iconVariants = tv({
  base: "",
  variants: {
    size: {
      sm: "size-14 max-w-14 max-h-14 min-w-14 min-h-14",
      md: "size-16 max-w-16 max-h-16 min-w-16 min-h-16",
      lg: "size-20 max-w-20 max-h-20 min-w-20 min-h-20",
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
