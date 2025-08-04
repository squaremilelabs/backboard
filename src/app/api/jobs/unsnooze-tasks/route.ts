import { NextResponse } from "next/server"
import { db } from "@/database/db-admin"

export async function GET() {
  try {
    const now = new Date().getTime()
    const tasksToUnsnooze = await db.query({
      tasks: {
        $: {
          where: {
            "inbox_state": "snoozed",
            "snooze_date": { $lte: now },
            "inbox.is_archived": false,
          },
          fields: ["id"],
        },
      },
    })
    const taskIds = tasksToUnsnooze.tasks.map((task: { id: string }) => task.id)
    await db.transact(
      taskIds.map((id) =>
        db.tx.tasks[id].update({
          inbox_state: "open",
          snooze_date: null,
        })
      )
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
