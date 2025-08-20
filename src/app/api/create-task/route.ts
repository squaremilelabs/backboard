import { NextRequest, NextResponse } from "next/server"
import z from "zod"
import { getAccountFromApiRequest } from "@/modules/auth/api-auth"
import { db } from "@/database/db-admin"
import { parseTaskCreateInput } from "@/database/models/task"

const CreateTaskPayloadSchema = z.strictObject({
  scope_id: z.uuidv4(),
  title: z.string().trim().min(1),
  content: z.string().trim().nullish(),
})

type CreateTaskPayloadType = z.infer<typeof CreateTaskPayloadSchema>

export async function POST(req: NextRequest) {
  try {
    const account = await getAccountFromApiRequest(req)
    if (!account) throw new Error("No account found from API request")

    const payload: CreateTaskPayloadType = await req.json()
    const { title, content, scope_id } = await CreateTaskPayloadSchema.parseAsync(payload)
    const { id, data, link } = parseTaskCreateInput({
      title,
      content,
      scope_id,
      status: "current",
      status_time: Date.now(),
    })
    const scopedDb = db.asUser({ email: account.user.email })

    await scopedDb.transact(db.tx.tasks[id].link(link).create(data))

    const createdTaskQuery = await scopedDb.query({ tasks: { $: { where: { id }, first: 1 } } })
    const createdTask = createdTaskQuery.tasks[0]
    return NextResponse.json(createdTask, { status: 200 })
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error(error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ message: errorMessage }, { status: 400 })
  }
}
