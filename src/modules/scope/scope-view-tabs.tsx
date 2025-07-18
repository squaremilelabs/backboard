import { useParams, usePathname } from "next/navigation"
import { Task } from "@zenstackhq/runtime/models"
import { Tab, TabList, Tabs } from "react-aria-components"
import { useFindUniqueScope } from "@/database/generated/hooks"
import { twv } from "@/lib/utils/tailwind"
import { Icon } from "@/lib/primitives/icon"

type ScopeView = "current" | "deferred" | "complete" | "archive"

const viewTabVariants = twv({
  base: "flex items-center px-8 py-4 gap-8 text-neutral-400 cursor-pointer",
  variants: {
    view: {
      current: "hover:text-blue-600",
      deferred: "hover:text-yellow-600",
      complete: "hover:text-purple-700",
      archive: "hover:text-neutral-600",
    },
    active: {
      true: "border-b-2 font-semibold",
    },
  },
  compoundVariants: [
    { view: "current", active: true, className: "border-blue-500 text-blue-600" },
    {
      view: "deferred",
      active: true,
      className: "border-yellow-500 text-yellow-600",
    },
    {
      view: "complete",
      active: true,
      className: "border-purple-500 text-purple-700",
    },
    {
      view: "archive",
      active: true,
      className: "border-neutral-500 text-neutral-600",
    },
  ],
})

export function ScopeViewTabs() {
  const params = useParams<{ id: string }>()
  const pathname = usePathname()
  const { data: scope } = useFindUniqueScope({
    where: { id: params.id },
    select: {
      tasks: {
        where: { archived_at: null },
      },
    },
  })

  const taskCounts = getTaskCounts(scope?.tasks ?? [])

  return (
    <Tabs orientation="horizontal">
      <TabList className="flex items-center gap-16">
        <Tab
          href={`/scope/${params.id}`}
          className={viewTabVariants({
            view: "current",
            active: pathname === `/scope/${params.id}`,
          })}
        >
          <p>Current</p>
          {taskCounts.current ? <span>{taskCounts.current}</span> : null}
        </Tab>
        <Tab
          href={`/scope/${params.id}/deferred`}
          className={viewTabVariants({
            view: "deferred",
            active: pathname === `/scope/${params.id}/deferred`,
          })}
        >
          <Icon icon="defer" size="sm" />
          <p>Deferred</p>
          {taskCounts.deferred ? <span>{taskCounts.deferred}</span> : null}
        </Tab>
        <Tab
          href={`/scope/${params.id}/complete`}
          className={viewTabVariants({
            view: "complete",
            active: pathname === `/scope/${params.id}/complete`,
          })}
        >
          <Icon icon="complete" size="sm" />
          <p>Complete</p>
          {taskCounts.complete ? <span>{taskCounts.complete}</span> : null}
        </Tab>
        <Tab
          href={`/scope/${params.id}/archive`}
          className={viewTabVariants({
            view: "archive",
            active: pathname === `/scope/${params.id}/archive`,
          })}
        >
          <Icon icon="archive" size="sm" />
          <p>Archive</p>
        </Tab>
      </TabList>
    </Tabs>
  )
}

function getTaskCounts(tasks: Task[]): Partial<Record<ScopeView, number>> {
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
