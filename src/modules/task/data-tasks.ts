import { useParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { id } from "@instantdb/react"
import { useInboxById } from "../inbox/data-inbox"
import { InboxView } from "../inbox/inbox-view-tabs"
import { useInstantUserId } from "../auth/instant-clerk"
import { Task } from "@/database/types"
import { db } from "@/database/db"

export function useCurrentViewInboxTasks() {
  const { id: inboxId, view: inboxView } = useParams<{ id: string; view: InboxView }>()

  const activeTasks = useActiveInboxTasks(inboxId)
  const snoozedTasks = useSnoozedInboxTasks(inboxId)
  const completedTasks = useCompletedInboxTasks(inboxId)
  const archivedTasks = useArchivedInboxTasks(inboxId)

  if (inboxView === "snoozed") return snoozedTasks
  if (inboxView === "complete") return completedTasks
  if (inboxView === "archive") return archivedTasks
  return activeTasks
}

export function useActiveInboxTasks(inboxId: string | null | undefined) {
  const { inbox } = useInboxById(inboxId)
  const { data, isLoading, error } = db.useQuery({
    tasks: {
      $: {
        where: {
          "inbox.id": inboxId ?? "PENDING_ID",
          "archived_date": { $isNull: true },
          "completed_date": { $isNull: true },
          "snooze_date": { $isNull: true },
          "snooze_indefinite": { $not: true },
        },
      },
    },
  })

  const tasks = data?.tasks ?? []
  const taskOrder = (inbox?.task_order ?? []) as string[]
  const sortedTasks = sortTasks(tasks, taskOrder)

  return {
    tasks: sortedTasks,
    isLoading,
    error,
  }
}

export function sortTasks(tasks: Task[], taskOrder: string[]) {
  // Tasks not in taskOrder
  const notInOrder = tasks
    .filter((task) => !taskOrder.includes(task.id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Tasks in taskOrder, in the order specified
  const inOrder = taskOrder
    .map((id) => tasks.find((task) => task.id === id))
    .filter((task): task is Task => !!task)

  return [...notInOrder, ...inOrder]
}

export function useSnoozedInboxTasks(inboxId: string | null | undefined) {
  const { data, isLoading, error } = db.useQuery({
    tasks: {
      $: {
        where: {
          "inbox.id": inboxId ?? "PENDING_ID",
          "archived_date": { $isNull: true },
          "completed_date": { $isNull: true },
          "or": [{ snooze_date: { $isNull: false } }, { snooze_indefinite: true }],
        },
        order: {
          snooze_date: "desc",
        },
      },
    },
  })
  return {
    tasks: data?.tasks ?? [],
    isLoading,
    error,
  }
}

export function useCompletedInboxTasks(inboxId: string | null | undefined) {
  const { data, isLoading, error } = db.useQuery({
    tasks: {
      $: {
        where: {
          "inbox.id": inboxId ?? "PENDING_ID",
          "archived_date": { $isNull: true },
          "completed_date": { $isNull: false },
          "snooze_date": { $isNull: true },
          "snooze_indefinite": { $not: true },
        },
        order: {
          completed_date: "desc",
        },
        limit: 30,
      },
    },
  })
  return {
    tasks: data?.tasks ?? [],
    isLoading,
    error,
  }
}

export function useArchivedInboxTasks(inboxId: string | null | undefined) {
  const { data, isLoading, error } = db.useQuery({
    tasks: {
      $: {
        where: {
          "inbox.id": inboxId ?? "PENDING_ID",
          "archived_date": { $isNull: false },
          "completed_date": { $isNull: true },
          "snooze_date": { $isNull: true },
          "snooze_indefinite": { $not: true },
        },
        order: {
          archived_date: "desc",
        },
        limit: 30,
      },
    },
  })
  return {
    tasks: data?.tasks ?? [],
    isLoading,
    error,
  }
}

export function useCreateTask(inboxId: string | null | undefined) {
  const instantUserId = useInstantUserId()

  return useMutation({
    mutationKey: ["task-create", instantUserId],
    mutationFn: async ({ title }: { title: string }) => {
      if (!instantUserId) return
      if (!inboxId) return
      await db.transact([
        db.tx.tasks[id()]
          .create({
            title,
            created_at: new Date().getTime(),
          })
          .link({ owner: instantUserId, inbox: inboxId }),
      ])
    },
  })
}

export function useArchiveTasks() {
  const instantUserId = useInstantUserId()

  return useMutation({
    mutationKey: ["tasks-archive", instantUserId],
    mutationFn: async (taskIds: string[]) => {
      if (!instantUserId) return
      if (taskIds.length === 0) return
      await db.transact(
        taskIds.map((id) =>
          db.tx.tasks[id].update({
            archived_date: new Date().getTime(),
            snooze_date: null,
            snooze_indefinite: false,
          })
        )
      )
    },
  })
}
