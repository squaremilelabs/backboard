import { NextRequest, NextResponse } from "next/server"
import { getAccountFromApiRequest } from "@/modules/auth/api-auth"
import { db } from "@/database/db-admin"

export async function GET(req: NextRequest) {
  try {
    const account = await getAccountFromApiRequest(req)
    if (!account) throw new Error("No account found from API request")

    const scopedDb = db.asUser({ email: account.user.email })

    const scopesQuery = await scopedDb.query({
      scopes: {
        $: {
          where: { "owner.id": account.id, "is_inactive": false },
          order: { title: "asc" },
        },
      },
    })

    return NextResponse.json(
      scopesQuery.scopes.map((scope) => ({ id: scope.id, title: scope.title })),
      { status: 200 }
    )
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error(error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ message: errorMessage }, { status: 400 })
  }
}
