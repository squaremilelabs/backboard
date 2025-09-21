export type ViewPage = "current" | "snoozed" | "recurring" | "done"

export type ViewParams = {
  list: ViewPage
  rootScopeId: string | null
  showInactive: boolean
}

export const DEFAULT_VIEW_PARAMS: ViewParams = {
  list: "current",
  rootScopeId: null,
  showInactive: false,
}
