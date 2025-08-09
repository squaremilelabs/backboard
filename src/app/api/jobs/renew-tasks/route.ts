import { NextResponse } from "next/server"
import { db } from "@/database/db-admin"
import { parseTaskUpdateInput } from "@/database/models/task"

export async function GET() {
  try {
    const now = new Date().getTime()
    const tasksToRenew = await db.query({
      tasks: {
        $: {
          where: {
            "status": "later",
            "status_time": { $lte: now },
            "scope.is_inactive": false,
          },
          fields: ["id"],
        },
      },
    })
    const taskIds = tasksToRenew.tasks.map((task: { id: string }) => task.id)
    await db.transact(
      taskIds.map((id) => {
        const { data } = parseTaskUpdateInput({ status: "now", prev_status: "later" })
        return db.tx.tasks[id].update(data)
      })
    )

    return NextResponse.json(
      {
        message: `Unsnoozed ${taskIds.length} tasks successfully.`,
      },
      { status: 200 }
    )
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.error(_error)
    return NextResponse.json(
      {
        message: "Failed to unsnooze tasks",
      },
      { status: 500 }
    )
  }
}
