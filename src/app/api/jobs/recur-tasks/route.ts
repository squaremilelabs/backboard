import { NextResponse } from "next/server"
import { tz } from "@date-fns/tz"
import { getDate, getDay, getHours } from "date-fns"
import { db } from "@/database/db-admin"
import { RecurringTask } from "@/database/models/recurring-task"
import { parseTaskCreateInput } from "@/database/models/task"
import { AccountCustomWorkHours } from "@/database/models/account"
import { DEFAULT_WORKING_HOURS } from "@/modules/auth/account-hours"

export async function GET() {
  try {
    const query = await db.query({
      recurring_tasks: {
        $: {
          where: {
            "is_inactive": false,
            "scope.is_inactive": false,
          },
        },
        tasks: {
          $: {
            where: {
              status: { $not: "done" },
            },
            fields: ["id"],
          },
        },
        scope: {
          $: {
            fields: ["id"],
          },
          owner: {
            $: {
              fields: ["custom_work_hours"],
            },
          },
        },
      },
    })

    // Filters out tasks that still have current instances
    const recurringTasks = query.recurring_tasks.filter((task) => task.tasks.length === 0) as Array<
      RecurringTask & {
        tasks: Array<{ id: string }>
        scope: { id: string; owner: { custom_work_hours: AccountCustomWorkHours } }
      }
    >

    const weekdayTasks = recurringTasks.filter((task) => {
      if (task.recur_day_type !== "weekday") return false
      const accountWorkHours = task.scope.owner.custom_work_hours ?? DEFAULT_WORKING_HOURS
      const tzWeekday = getDay(new Date(), { in: tz(accountWorkHours.tz) })
      const tzHour = getHours(new Date(), { in: tz(accountWorkHours.tz) })
      return accountWorkHours.start === tzHour && task.recur_days.includes(tzWeekday)
    })

    const monthdayTasks = recurringTasks.filter((task) => {
      if (task.recur_day_type !== "monthday") return false
      const accountWorkHours = task.scope.owner.custom_work_hours ?? DEFAULT_WORKING_HOURS
      const tzMonthday = getDate(new Date(), { in: tz(accountWorkHours.tz) })
      const tzHour = getHours(new Date(), { in: tz(accountWorkHours.tz) })
      return accountWorkHours.start === tzHour && task.recur_days.includes(tzMonthday)
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
          status_time: Date.now(),
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
