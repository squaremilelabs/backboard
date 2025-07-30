import { useCurrentInboxView } from "../inbox/inbox-views"
import { db } from "@/database/db"
import { sortItemsByIdOrder } from "@/common/utils/list-utils"
import { Task } from "@/database/models/task"

export function useCurrentViewTasks() {
  const { id: inboxId, view: inboxView } = useCurrentInboxView()

  const inboxQuery = db.useQuery({
    inboxes: { $: { where: { id: inboxId } } },
  })
  const inbox = inboxQuery.data?.inboxes[0]

  const taskQuery = db.useQuery({
    tasks: {
      $: {
        where: {
          "inbox.id": inboxId,
          "inbox_state": inboxView,
        },
        order:
          inboxView === "snoozed"
            ? { snooze_date: "asc" }
            : inboxView === "archived"
              ? { archive_date: "desc" }
              : undefined,
        limit: inboxView === "archived" ? 30 : undefined,
      },
    },
  })

  let result: Task[] = (taskQuery.data?.tasks ?? []) as Task[]

  if (inboxView === "open") {
    result = sortItemsByIdOrder({
      items: inbox ? result : [],
      idOrder: inbox?.open_task_order ?? [],
      missingIdsPosition: "start",
      sortMissingIds(left, right) {
        return right.created_at - left.created_at
      },
    })
  }

  if (inboxView === "snoozed") {
    result = [...result].sort((left, right) => {
      const leftSnooze = left.snooze_date ?? new Date(2100, 1, 1).getTime()
      const rightSnooze = right.snooze_date ?? new Date(2100, 1, 1).getTime()
      return leftSnooze - rightSnooze
    })
  }

  if (inboxView === "archived") {
    result = [...result].sort((left, right) => {
      const leftArchive = left.archive_date ?? 0
      const rightArchive = right.archive_date ?? 0
      return rightArchive - leftArchive
    })
  }

  return result
}
