import { twm } from "~/smui/utils/tailwind"

export function TaskCountChip({
  count,
  color,
}: {
  count: number
  color: "primary" | "primary-muted" | "neutral" | "neutral-muted"
}) {
  return (
    <span
      className={twm(
        "px-space-md py-space-sm rounded-full text-xs leading-(--text-xs) font-bold",
        "border border-transparent",
        color === "primary" && "bg-primary-bg text-primary-fg",
        color === "primary-muted" &&
          "bg-primary-muted-bg text-primary-muted-fg border-primary-muted-border",
        color === "neutral" && "bg-neutral-bg text-neutral-fg",
        color === "neutral-muted" &&
          "bg-neutral-muted-bg text-neutral-muted-fg border-neutral-muted-border"
      )}
    >
      {count}
    </span>
  )
}
