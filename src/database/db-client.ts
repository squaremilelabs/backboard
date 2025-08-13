"use client"

import { init, InstaQLParams } from "@instantdb/react"
import schema, { AppSchema } from "./instant.schema"
import { ModelMap, ModelKey } from "./models/_map"

export const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  schema,
})

type QueryParams = InstaQLParams<AppSchema>

export function useDBQuery<T extends ModelMap[K], K extends ModelKey>(
  model: K,
  params: QueryParams[K] | null
): {
  [P in K]: T[] | undefined
} & {
  isLoading: boolean
  error: { message: string } | undefined
} {
  const { data, isLoading, error } = db.useQuery(
    params
      ? {
          [model]: params,
        }
      : null
  )
  return {
    ...({ [model]: data?.[model] as unknown as T[] | undefined } as { [P in K]: T[] | undefined }),
    isLoading,
    error,
  }
}
