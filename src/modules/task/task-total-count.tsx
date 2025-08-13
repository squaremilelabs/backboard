"use client"
import { useAuth } from "../auth/use-auth"
import { db } from "@/database/db-client"
import { Task } from "@/database/models/task"

export function useAccountOpenTasks() {
  const { instantAccount: account } = useAuth()

  const taskQuery = db.useQuery(
    account
      ? {
          tasks: {
            $: {
              where: {
                "scope.owner.id": account.id, // random placeholder
                "scope.is_inactive": false,
                "status": "current",
              },
            },
          },
        }
      : null
  )

  return {
    tasks: taskQuery.data?.tasks as Task[] | undefined,
    isLoading: taskQuery.isLoading,
    error: taskQuery.error,
  }
}
