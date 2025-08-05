import { NextRequest } from "next/server"
import { id } from "@instantdb/admin"
import { db } from "@/database/db-admin"
import { getAccountFromApiRequest } from "@/modules/auth/api-auth"

export async function POST(req: NextRequest) {
  try {
    const account = await getAccountFromApiRequest(req)
    const payload = await req.json()

    const scopedDb = db.asUser({ email: account?.user?.email ?? "NO_EMAIL" })

    const newTaskId = id()
    await scopedDb.transact([
      db.tx.tasks[newTaskId].link({ inbox: payload.inbox_id }).create({
        title: payload.title || null,
        content: payload.content || null,
        created_at: new Date().getTime(),
        inbox_state: "open",
      }),
    ])
    const newTaskQuery = await scopedDb.query({
      tasks: {
        $: {
          where: { id: newTaskId },
          first: 1,
        },
      },
    })
    const newTask = newTaskQuery.tasks[0]

    return Response.json(newTask, { status: 200 })
  } catch (error) {
    return Response.json(error, { status: 400 })
  }
}
