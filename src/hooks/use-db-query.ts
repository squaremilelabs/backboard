"use client"

import { InstaQLParams } from "@instantdb/admin"
import { AppSchema } from "@/database/instant.schema"
import { ModelMap, ModelKey } from "@/database/models/_map"
import { db } from "@/database/db-client"

type QueryParams = InstaQLParams<AppSchema>

export function useDBQuery<T extends ModelMap[K], K extends ModelKey = ModelKey>(
  model: K,
  params: QueryParams[K] | null
): {
  [P in K]: T[] | undefined
} & {
  isLoading: boolean
  error: { message: string } | undefined
} {
  const queryParams = params ? { [model]: params } : null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- produces build error if not provided, reccommended workaround by instant team
  const { data, isLoading, error } = db.useQuery(queryParams as any)
  return {
    ...({ [model]: data?.[model] as unknown as T[] | undefined } as { [P in K]: T[] | undefined }),
    isLoading,
    error,
  }
}
