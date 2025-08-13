import { NextResponse } from "next/server"
import { db } from "@/database/db-admin"
import { RecurringTask } from "@/database/models/recurring-task"
import { parseTaskCreateInput } from "@/database/models/task"

export async function GET() {
  try {
    // WeekdayQuery

    const query = await db.query({
      recurring_tasks: {
        $: {
          where: {
            "is_inactive": false,
            "scope.is_inactive": false,
          },
        },
        scope: {
          $: {
            fields: ["id"],
          },
        },
      },
    })

    const recurringTasks = query.recurring_tasks as Array<RecurringTask & { scope: { id: string } }>

    const currentWeekday = new Date().getUTCDay()
    const weekdayTasks = recurringTasks.filter((task) => {
      if (task.recur_day_type !== "weekday") return false
      return task.recur_days.includes(currentWeekday)
    })

    const currentMonthDay = new Date().getUTCDate()
    const monthdayTasks = recurringTasks.filter((task) => {
      if (task.recur_day_type !== "monthday") return false
      return task.recur_days.includes(currentMonthDay)
    })

    const tasksToRecur = [...weekdayTasks, ...monthdayTasks]

    await db.transact(
      tasksToRecur.map((task) => {
        const { id, data, link } = parseTaskCreateInput({
          scope_id: task.scope.id,
          recurring_task_id: task.id,
          title: task.title,
          content: task.content || null,
          status: "current",
        })

        return db.tx.tasks[id].link(link).create(data)
      })
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
