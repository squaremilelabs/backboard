import {
  AlarmClockIcon,
  CircleCheckBigIcon,
  DiamondIcon,
  LucideIcon,
  RefreshCwIcon,
} from "lucide-react"

export type ViewList = "current" | "snoozed" | "recurring" | "done"

export type ViewParams = {
  list: ViewList
  rootScopeId: string | null
  showInactive: boolean
}

export const DEFAULT_VIEW_PARAMS: ViewParams = {
  list: "current",
  rootScopeId: null,
  showInactive: false,
}

export type ViewListDisplayItem = { key: ViewList; label: string; Icon: LucideIcon }
export const VIEW_LISTS: ViewListDisplayItem[] = [
  { key: "current", label: "Current", Icon: DiamondIcon },
  { key: "snoozed", label: "Snoozed", Icon: AlarmClockIcon },
  { key: "recurring", label: "Recurring", Icon: RefreshCwIcon },
  { key: "done", label: "Done", Icon: CircleCheckBigIcon },
]
