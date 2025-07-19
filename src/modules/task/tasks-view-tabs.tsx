import { Task } from "@zenstackhq/runtime/models"
import { Tab, TabList, Tabs } from "react-aria-components"
import { TasksView, useTasksView } from "./use-tasks-view"
import { useFindUniqueScope } from "@/database/generated/hooks"
import { twm } from "@/lib/utils/tailwind"
import { Icon, IconKey } from "@/lib/primitives/icon"

const VIEWS: { key: TasksView; title: string; icon: IconKey; path: string }[] = [
  { key: "current", title: "Current", icon: "current", path: "" },
  { key: "deferred", title: "Deferred", icon: "defer", path: "/deferred" },
  { key: "complete", title: "Complete", icon: "complete", path: "/complete" },
  { key: "archive", title: "Archive", icon: "archive", path: "/archive" },
]

export function TasksViewTabs() {
  const { scopeId, view: currentView } = useTasksView()

  const { data: scope } = useFindUniqueScope({
    where: { id: scopeId },
    select: {
      tasks: {
        where: { archived_at: null },
      },
    },
  })

  const taskCounts = getTaskCounts(scope?.tasks ?? [])

  return (
    <Tabs orientation="horizontal">
      <TabList className="flex items-center gap-16 border-b">
        {VIEWS.map((view) => {
          const isActive = currentView === view.key
          const count = taskCounts[view.key]
          return (
            <Tab
              key={view.key}
              href={`/scope/${scopeId}${view.path}`}
              className={twm(
                "flex cursor-pointer items-center gap-8 px-16 py-4 text-neutral-400",
                isActive ? "border-b-2 border-neutral-600 font-semibold text-neutral-600" : "",
                "!outline-0",
                "focus-visible:border-yellow-600"
              )}
            >
              <Icon icon={view.icon} size="sm" />
              <p>{view.title}</p>
              {count ? <p>({count})</p> : null}
            </Tab>
          )
        })}
      </TabList>
    </Tabs>
  )
}

function getTaskCounts(tasks: Task[]): Partial<Record<TasksView, number>> {
  const counts = {
    current: 0,
    deferred: 0,
    complete: 0,
  }

  tasks.forEach((task) => {
    if (task.completed_at) {
      counts.complete += 1
    } else if (task.deferred_to) {
      counts.deferred += 1
    } else {
      counts.current += 1
    }
  })

  return counts
}
