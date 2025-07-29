import { GripVerticalIcon } from "lucide-react"
import { Emoji } from "emoji-picker-react"
import { cn, ClassValue } from "~/smui/utils"
import { Inbox } from "@/database/models/inbox"
import { Task } from "@/database/models/task"
import { ListBoxItem } from "~/smui/list-box/components"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"

export function InboxListItem({
  inbox,
  className,
}: {
  inbox: Inbox & { tasks: Task[] }
  className: ClassValue
}) {
  const openTaskCount = inbox.tasks.length
  return (
    <ListBoxItem
      id={inbox.id}
      textValue={inbox.title}
      href={`/inbox/${inbox.id}`}
      className={className}
    >
      {({ allowsDragging }) => (
        <>
          {allowsDragging && (
            <Button slot="drag" className="cursor-move">
              <Icon icon={<GripVerticalIcon />} variants={{ size: "sm" }} />
            </Button>
          )}
          {inbox?.emoji ? (
            <Icon icon={<Emoji unified={inbox?.emoji} />} variants={{ size: "sm" }} />
          ) : null}
          <p className="grow truncate">{inbox.title}</p>
          {openTaskCount > 0 && (
            <span className={cn("flex w-30 justify-center", "text-primary-4 text-sm font-bold")}>
              {openTaskCount}
            </span>
          )}
        </>
      )}
    </ListBoxItem>
  )
}
