import { useParams, usePathname } from "next/navigation"

export type TasksView = "current" | "deferred" | "complete" | "archive"

export function useTasksView(): { scopeId: string; view: TasksView } {
  const { id: scopeId } = useParams<{ id: string }>()
  const pathname = usePathname()

  let view: TasksView = "current"

  if (pathname.endsWith("archive")) {
    view = "archive"
  }
  if (pathname.endsWith("complete")) {
    view = "complete"
  }
  if (pathname.endsWith("deferred")) {
    view = "deferred"
  }

  return { scopeId, view }
}
