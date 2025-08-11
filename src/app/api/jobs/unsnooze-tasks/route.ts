import { NextResponse } from "next/server"
import { db } from "@/database/db-admin"
import { parseTaskUpdateInput } from "@/database/models/task"

export async function GET() {
  try {
    const now = new Date().getTime()
    const tasksToUnsnooze = await db.query({
      tasks: {
        $: {
          where: {
            "status": "snoozed",
            "status_time": { $lte: now },
            "scope.is_inactive": false,
          },
          fields: ["id"],
        },
      },
    })
    const taskIds = tasksToUnsnooze.tasks.map((task: { id: string }) => task.id)
    await db.transact(
      taskIds.map((id) => {
        const { data } = parseTaskUpdateInput({ status: "current", prev_status: "snoozed" })
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
