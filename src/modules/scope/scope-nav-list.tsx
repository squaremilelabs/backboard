import { ListBox, ListBoxItem } from "react-aria-components"
import { useParams } from "next/navigation"
import { useFindManyScope } from "@/database/generated/hooks"
import { twm } from "@/lib/utils/tailwind"

export function ScopeNavList() {
  const params = useParams<{ id: string }>()
  const { data: scopes } = useFindManyScope({
    where: { archived_at: null },
    include: {
      _count: {
        select: { tasks: { where: { archived_at: null, completed_at: null, deferred_to: null } } },
      },
    },
    orderBy: { title: "asc" },
  })

  return (
    <ListBox
      aria-label="Scope List"
      items={scopes ?? []}
      dependencies={[scopes, params.id]}
      className="flex flex-col gap-2"
    >
      {(item) => {
        const isActive = item.id === params.id
        return (
          <ListBoxItem
            id={item.id}
            textValue={item.title}
            className={twm(
              "px-8 py-4",
              isActive ? "bg-neutral-200 text-neutral-950" : "text-neutral-500 hover:bg-neutral-100"
            )}
            href={`/scope/${item.id}`}
          >
            <p className="truncate font-medium">{item.title}</p>
          </ListBoxItem>
        )
      }}
    </ListBox>
  )
}
