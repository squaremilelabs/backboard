import { GripVerticalIcon } from "lucide-react"
import { Emoji } from "emoji-picker-react"
import { ClassValue } from "~/smui/utils"
import { Inbox } from "@/database/models/inbox"
import { Task } from "@/database/models/task"
import { ListBoxItem } from "~/smui/list-box/components"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { label } from "@/common/components/class-names"

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
      className={[
        className,
        "text-neutral-text data-selected:text-base-text",
        "font-medium data-selected:font-semibold",
        "opacity-70 hover:opacity-100 data-selected:opacity-100",
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
              className={label({
                class: ["flex w-30 justify-center", "text-primary-text"],
              })}
            >
              {openTaskCount}
            </span>
          )}
          {inbox.is_archived && <span className={label()}>ARCHIVED</span>}
        </>
      )}
    </ListBoxItem>
  )
}
