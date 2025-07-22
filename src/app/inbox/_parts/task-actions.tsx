import { Button, Group } from "react-aria-components"
import { Icon } from "@/lib/components/icon"
import { cn } from "~/smui/utils"
import { updateManyTasks } from "@/database/models/task"

const actionButtonClassName = cn(
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
  const handleArchive = () => {
    updateManyTasks(selectedTaskIds, { inbox_state: "archived" }).then(() => {
      setSelectedTaskIds([])
    })
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
