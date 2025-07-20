import { id } from "@instantdb/react"
import { useMutation } from "@tanstack/react-query"
import { useInstantUserId } from "@/lib/auth/instant-clerk"
import { db } from "@/database/db"

export function useCreateInbox() {
  const instantUserId = useInstantUserId()
  return useMutation({
    mutationKey: ["inbox-create", instantUserId],
    mutationFn: async ({ title }: { title: string }) => {
      if (!instantUserId) return
      await db.transact([
        db.tx.inboxes[id()]
          .create({
            title,
            created_at: new Date().getTime(),
            task_order: [],
            is_archived: false,
          })
          .link({ owner: instantUserId }),
      ])
    },
  })
}

export function useUpdateInbox() {
  return useMutation({
    mutationKey: ["inbox-update"],
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string
      title?: string
      task_order?: string[]
      is_archived?: boolean
    }) => {
      await db.transact([
        db.tx.inboxes[id].update({
          title: data.title,
          task_order: data.task_order,
          is_archived: data.is_archived,
        }),
      ])
    },
  })
}

export function useActiveInboxes() {
  const { data, isLoading, error } = db.useQuery({
    inboxes: {
      $: { where: { is_archived: false } },
    },
  })

  return {
    inboxes: data?.inboxes ?? [],
    isLoading,
    error,
  }
}

export function useInboxById(id: string | null | undefined) {
  const { data, isLoading, error } = db.useQuery({
    inboxes: {
      $: {
        where: {
          id: id ?? "NO_ID",
        },
      },
    },
  })
  return {
    inbox: data?.inboxes?.[0] ?? null,
    isLoading,
    error,
  }
}
