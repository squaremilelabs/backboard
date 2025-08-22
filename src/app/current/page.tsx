import { Metadata } from "next"
import { GroupedTaskLists } from "@/modules/task/task-list/grouped-task-lists"

export const metadata: Metadata = {
  title: "Current Tasks",
}

export default function Page() {
  return <GroupedTaskLists statusView="current" />
}
