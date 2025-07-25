import { id, init } from "@instantdb/admin"
import { NextResponse } from "next/server"
import schema from "@/database/instant.schema"
import { RecurringTask } from "@/database/models/recurring_task"

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID as string,
  adminToken: process.env.INSTANT_APP_ADMIN_TOKEN as string,
  schema: schema,
})

export async function GET() {
  try {
    // DAILY TASKS
    const query = await db.query({
      recurring_tasks: {
        $: {
          where: {
            is_archived: false,
          },
        },
        inbox: {
          $: {
            fields: ["id"],
          },
        },
      },
    })

    const recurringTasks = query.recurring_tasks as Array<RecurringTask & { inbox: { id: string } }>

    const currentDayOfWeek = new Date().getUTCDay()

    const dailyTasks = recurringTasks.filter((task) => {
      if (task.frequency.type !== "daily") return false
      if (currentDayOfWeek === 0 || currentDayOfWeek === 6) {
        // If it's a weekend and the task skips weekends, skip it
        if (task.frequency.skip_weekends) return false
      }
      return true
    })

    const weeklyTasks = recurringTasks.filter((task) => {
      if (task.frequency.type !== "weekly") return false
      return task.frequency.weekday === currentDayOfWeek
    })

    const currentDayOfMonth = new Date().getUTCDate()
    const monthlyTasks = recurringTasks.filter((task) => {
      if (task.frequency.type !== "monthly") return false
      return task.frequency.day === currentDayOfMonth
    })

    const tasksToRecur = [...dailyTasks, ...weeklyTasks, ...monthlyTasks]

    await db.transact(
      tasksToRecur.map((task) =>
        db.tx.tasks[id()].link({ inbox: task.inbox.id }).create({
          created_at: new Date().getTime(),
          title: `[${task.frequency.type.toUpperCase()}] ${task.title}`,
          content: task.content,
          inbox_state: "open",
        })
      )
    )

    return NextResponse.json(
      {
        message: `Recurred ${tasksToRecur.length} tasks successfully.`,
      },
      { status: 200 }
    )
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.error(_error)
    return NextResponse.json(
      {
        message: "Failed to recur tasks",
      },
      { status: 500 }
    )
  }
}
