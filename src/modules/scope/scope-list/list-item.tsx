import { GripVerticalIcon } from "lucide-react"
import { Emoji } from "emoji-picker-react"
import { ClassValue } from "~/smui/utils"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { typography } from "@/common/components/class-names"
import { GridListItem } from "~/smui/grid-list/components"
import { cn } from "~/smui/utils"
import { Scope } from "@/database/models/scope"
import { Task } from "@/database/models/task"

export function ScopeListItem({
  scope,
  className,
  isSelected,
}: {
  scope: Scope & { tasks: Task[] }
  className: ClassValue
  isSelected: boolean
}) {
  const nowTaskCount = scope.tasks.length
  return (
    <GridListItem
      id={scope.id}
      textValue={scope.title}
      href={`/scope/${scope.id}`}
      className={[
        className,
        "text-neutral-text rounded-sm font-medium opacity-70 hover:opacity-100",
        isSelected && "text-base-text border-base-outline border-l-4 font-semibold !opacity-100",
        "transition-colors",
      ]}
    >
      {({ allowsDragging }) => (
        <>
          {allowsDragging && (
            <Button
              slot="drag"
              className={[
                "text-neutral-muted-text !cursor-move",
                isSelected && "text-base-outline",
              ]}
              excludeFromTabOrder
              isDisabled
            >
              <Icon icon={<GripVerticalIcon />} variants={{ size: "sm" }} />
            </Button>
          )}
          {scope?.icon?.type === "emoji" ? (
            <Icon icon={<Emoji unified={scope.icon.unified} />} variants={{ size: "sm" }} />
          ) : null}
          <p className="grow truncate">{scope.title}</p>
          {nowTaskCount > 0 && !scope.is_inactive && (
            <span
              className={cn(
                "flex min-w-30 items-center justify-center",
                "text-primary-text px-4 text-sm"
              )}
            >
              {nowTaskCount}
            </span>
          )}
          {scope.is_inactive && <span className={typography({ type: "label" })}>INACTIVE</span>}
        </>
      )}
    </GridListItem>
  )
}
