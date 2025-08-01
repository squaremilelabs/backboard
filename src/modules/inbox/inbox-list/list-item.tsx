import { GripVerticalIcon } from "lucide-react"
import { Emoji } from "emoji-picker-react"
import { ClassValue } from "~/smui/utils"
import { Inbox } from "@/database/models/inbox"
import { Task } from "@/database/models/task"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { typography } from "@/common/components/class-names"
import { GridListItem } from "~/smui/grid-list/components"

export function InboxListItem({
  inbox,
  className,
  isSelected,
}: {
  inbox: Inbox & { tasks: Task[] }
  className: ClassValue
  isSelected: boolean
}) {
  const openTaskCount = inbox.tasks.length
  return (
    <GridListItem
      id={inbox.id}
      textValue={inbox.title}
      href={`/inbox/${inbox.id}`}
      className={[
        className,
        "text-neutral-text font-medium opacity-70 hover:opacity-100",
        isSelected && "text-base-text bg-neutral-muted-bg font-semibold opacity-100",
      ]}
    >
      {({ allowsDragging }) => (
        <>
          {allowsDragging && (
            <Button
              slot="drag"
              className="text-neutral-muted-text !cursor-move"
              excludeFromTabOrder
              isDisabled
            >
              <Icon icon={<GripVerticalIcon />} variants={{ size: "sm" }} />
            </Button>
          )}
          {inbox?.emoji ? (
            <Icon icon={<Emoji unified={inbox?.emoji} />} variants={{ size: "sm" }} />
          ) : null}
          <p className="grow truncate">{inbox.title}</p>
          {openTaskCount > 0 && !inbox.is_archived && (
            <span
              className={typography({
                type: "label",
                class: ["flex w-30 justify-center", "text-primary-text"],
              })}
            >
              {openTaskCount}
            </span>
          )}
          {inbox.is_archived && <span className={typography({ type: "label" })}>ARCHIVED</span>}
        </>
      )}
    </GridListItem>
  )
}
