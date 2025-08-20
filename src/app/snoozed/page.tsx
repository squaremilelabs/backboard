import { Metadata } from "next"
import { UnscopedTaskList } from "@/modules/task/task-list/unscoped-task-list"

export const metadata: Metadata = {
  title: "Snoozed Tasks",
}

export default function Page() {
  return <UnscopedTaskList status="snoozed" />
}
