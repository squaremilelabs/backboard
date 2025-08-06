import { NextRequest } from "next/server"
import { db } from "@/database/db-admin"

export async function getAccountFromApiRequest(req: NextRequest) {
  const apiKeyHeader = req.headers.get("x-backboard-api-key")

  if (!apiKeyHeader) return null

  const accountQuery = await db.query({
    accounts: {
      $: {
        where: { api_key: apiKeyHeader },
        first: 1,
      },
      user: {},
    },
  })
  const account = accountQuery.accounts[0]

  if (!account) return null
  if (!account.user) return null
  if (!account.api_key) return null
  if (!account.user) return null

  if (account.api_key !== apiKeyHeader) return null

  return account
}
