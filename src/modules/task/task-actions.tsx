import { Button, Group } from "react-aria-components"
import { useArchiveTasks } from "./data-tasks"
import { Icon } from "@/lib/primitives/icon"
import { twm } from "@/lib/utils/tailwind"

const actionButtonClassName = twm(
  "flex items-center gap-8 px-16",
  "font-medium",
  "hover:opacity-70 cursor-pointer"
)

export function TaskActions({
  selectedTaskIds,
  setSelectedTaskIds,
}: {
  selectedTaskIds: string[]
  setSelectedTaskIds: (ids: string[]) => void
}) {
  const { mutate: archiveTasks } = useArchiveTasks()
  const handleArchive = () => {
    archiveTasks(selectedTaskIds)
    setSelectedTaskIds([])
  }

  return (
    <Group className="border border-transparent py-8">
      <Button className={actionButtonClassName} onPress={handleArchive}>
        <Icon icon="archive" />
        Archive
      </Button>
    </Group>
  )
}
