import { id } from "@instantdb/react"
import { db } from "../db"

export type Account = {
  id: string
  inbox_order?: string[] | null
}

export async function initializeAccount(userId: string) {
  const accountQuery = await db.queryOnce({ accounts: { $: { where: { "user.id": userId } } } })
  if (accountQuery.data?.accounts.length) return
  return db.transact([db.tx.accounts[id()].link({ user: userId }).create({ inbox_order: [] })])
}

export type AccountUpdateParams = {
  inbox_order?: string[]
}

export async function updateAccount(id: string, data: AccountUpdateParams) {
  return db.transact([
    db.tx.accounts[id].update({
      inbox_order: data.inbox_order,
    }),
  ])
}
