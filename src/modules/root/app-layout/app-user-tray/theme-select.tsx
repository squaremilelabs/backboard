"use client"

import { useTheme } from "next-themes"
import { typography } from "@/common/components/class-names"
import { Select, SelectButton, SelectPopover } from "~/smui/select/components"
import { ListBox, ListBoxItem } from "~/smui/list-box/components"
import { cn } from "~/smui/utils"

const themeOptions = [
  { key: "system", dotClassName: "bg-(--sml-gold-500)", label: "System / SML Gold" },
  { key: "light", dotClassName: "bg-(--sml-gold-400)", label: "Light / SML Gold" },
  { key: "dark", dotClassName: "bg-(--sml-gold-600)", label: "Dark / SML Gold" },
  { key: "sml-blue-light", dotClassName: "bg-(--sml-blue-400)", label: "Light / SML Blue" },
  { key: "sml-blue-dark", dotClassName: "bg-(--sml-blue-600)", label: "Dark / SML Blue" },
  { key: "jeong-light", dotClassName: "bg-(--jeong-lavendar-400)", label: "Light / Jeongy Lav" },
  { key: "jeong-dark", dotClassName: "bg-(--jeong-lavendar-600)", label: "Dark / Jeongy Lav" },
]

export function AppUserTrayThemeSelect() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col">
      <p className={typography({ type: "label", className: "p-4" })}>Theme</p>
      <Select
        selectedKey={theme}
        onSelectionChange={(key) => setTheme(key as string)}
        classNames={{
          base: "flex flex-col gap-2 p-4",
          button: {
            base: "border py-4 px-8 gap-8",
            value: "flex items-center gap-8 font-medium",
          },
          popover: "bg-base-bg rounded-sm border-2 p-4 w-(--trigger-width) max-h-300 overflow-auto",
        }}
      >
        {(_, classNames) => (
          <>
            <SelectButton classNames={classNames.button}>
              {({ defaultChildren }) => defaultChildren}
            </SelectButton>
            <SelectPopover className={classNames.popover}>
              <ListBox
                items={themeOptions}
                classNames={{
                  base: ["max-h-300 overflow-auto"],
                  item: [
                    "flex items-center gap-8 text-sm",
                    "not-data-disabled:cursor-pointer not-data-disabled:hover:bg-neutral-muted-bg",
                    "px-8 py-4 rounded-sm text-neutral-text",
                    "data-selected:text-base-text data-selected:font-medium data-selected:border",
                  ],
                }}
              >
                {(option, classNames) => {
                  return (
                    <ListBoxItem
                      id={option.key}
                      textValue={option.label}
                      className={classNames.item}
                    >
                      <div className={cn("size-12 rounded-full", option.dotClassName)} />
                      <span>{option.label}</span>
                    </ListBoxItem>
                  )
                }}
              </ListBox>
            </SelectPopover>
          </>
        )}
      </Select>
    </div>
  )
}
