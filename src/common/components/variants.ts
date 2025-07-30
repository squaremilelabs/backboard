import { tv } from "~/smui/utils"

export const label = tv({
  base: ["text-sm text-neutral-muted-text uppercase", "min-w-fit tracking-wider font-semibold"],
})

export const panel = tv({
  base: ["flex flex-col w-full max-w-full", "bg-base-bg", "border-2 divide-y rounded-sm"],
})
