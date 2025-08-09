// import { id, InstaQLParams } from "@instantdb/react"
// import { db } from "../db-client"
// import { AppSchema } from "../instant.schema"

// export type Account = {
//   id: string
//   inbox_order?: string[] | null
// }

// export async function initializeAccount(userId: string) {
//   const accountQuery = await db.queryOnce({ accounts: { $: { where: { "user.id": userId } } } })
//   if (accountQuery.data?.accounts.length) return
//   return db.transact([db.tx.accounts[id()].link({ user: userId }).create({ inbox_order: [] })])
// }

// export type AccountUpdateParams = {
//   inbox_order?: string[]
// }

// export async function updateAccount(id: string, data: AccountUpdateParams) {
//   return db.transact([
//     db.tx.accounts[id].update({
//       inbox_order: data.inbox_order,
//     }),
//   ])
// }

// export type AccountQueryParams = InstaQLParams<AppSchema>["accounts"]

// export function useAccountQuery<T extends Account = Account>(
//   params: AccountQueryParams | null
// ): {
//   data: T[] | undefined
//   isLoading: boolean
//   error: { message: string } | undefined
// } {
//   const { data, isLoading, error } = db.useQuery(params ? { accounts: params } : null)
//   return {
//     data: data?.accounts as T[],
//     isLoading,
//     error,
//   }
// }
