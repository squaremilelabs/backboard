import { NextRequest } from "next/server"
import { getAccountFromApiRequest } from "@/modules/auth/api-auth"

export async function GET(req: NextRequest) {
  try {
    const account = await getAccountFromApiRequest(req)
    if (!account) throw new Error("Account not found or invalid API key")
    return Response.json(
      {
        id: account.id,
        email: account.user?.email,
      },
      { status: 200 }
    )
  } catch (error) {
    return Response.json(error, { status: 400 })
  }
}
