import { Prisma } from "@zenstackhq/runtime/models"
import { useTasksView } from "./use-tasks-view"
import { useFindManyTask } from "@/database/generated/hooks"

export function useCurrentViewTasks() {
  const { scopeId, view } = useTasksView()

  let whereInput: Prisma.TaskWhereInput = {}

  let orderByInput: Prisma.TaskOrderByWithRelationInput = {}

  if (view === "current") {
    whereInput = {
      scope_id: scopeId,
      deferred_to: null,
      completed_at: null,
      archived_at: null,
    }
  }

  if (view === "deferred") {
    whereInput = { deferred_to: { not: null } }
    orderByInput = { deferred_to: { sort: "asc", nulls: "last" } }
  }

  if (view === "complete") {
    whereInput = { completed_at: { not: null } }
    orderByInput = { completed_at: "desc" }
  }

  if (view === "archive") {
    whereInput = { archived_at: { not: null } }
    orderByInput = { archived_at: "desc" }
  }

  return useFindManyTask({
    where: { scope_id: scopeId, ...whereInput },
    orderBy: orderByInput,
    take: view === "archive" ? 30 : undefined,
  })
}
