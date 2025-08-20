import { NextRequest, NextResponse } from "next/server"
import { getAccountFromApiRequest } from "@/modules/auth/api-auth"

export async function GET(req: NextRequest) {
  try {
    const account = await getAccountFromApiRequest(req)
    if (!account) throw new Error("No account found from api request")
    const result = {
      id: account.id,
      email: account.user.email,
    }
    return NextResponse.json(result, { status: 200 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ message: errorMessage }, { status: 400 })
  }
}
