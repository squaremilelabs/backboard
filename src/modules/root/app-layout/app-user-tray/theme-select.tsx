"use client"

import { useTheme } from "next-themes"
import { Laptop2Icon, LucideIcon, MoonIcon, SunIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { typography } from "@/common/components/class-names"
import { Select, SelectButton, SelectPopover } from "~/smui/select/components"
import { ListBox, ListBoxItem } from "~/smui/list-box/components"
import { cn } from "~/smui/utils"
import { Icon } from "~/smui/icon/components"
import { useAuth } from "@/modules/auth/use-auth"
import { Account, parseAccountUpdateInput } from "@/database/models/account"
import { db } from "@/database/db-client"

type AccentColorKey = NonNullable<NonNullable<Account["app_config"]>["accent_color"]>

type AccentColorOption = {
  key: AccentColorKey
  bgClassName: string
  textClassName: string
  label: string
}

const accentColorOptions: AccentColorOption[] = [
  {
    key: "sml-gold",
    bgClassName: "bg-(--sml-gold-500)",
    textClassName: "text-(--sml-gold-500)",
    label: "Square Mile Labs",
  },
  {
    key: "sml-blue",
    bgClassName: "bg-(--sml-blue-500)",
    textClassName: "text-(--sml-blue-500)",
    label: "Hoboken",
  },
  {
    key: "jeong-lav",
    bgClassName: "bg-(--jeong-lav-500)",
    textClassName: "text-(--jeong-lav-500)",
    label: "Jeongy",
  },
  {
    key: "furey-orange",
    bgClassName: "bg-(--furey-orange-500)",
    textClassName: "text-(--furey-orange-500)",
    label: "Furey",
  },
]

type ThemeOption = {
  key: "light" | "dark" | "system"
  label: string
  icon: LucideIcon
}
const themeOptions: ThemeOption[] = [
  { key: "light", label: "Light", icon: SunIcon },
  { key: "dark", label: "Dark", icon: MoonIcon },
  { key: "system", label: "System", icon: Laptop2Icon },
]

export function AppUserTrayThemeSelect() {
  const { instantAccount } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()

  // Reset theme to one of light/dark/system if it is not one of the options
  useEffect(() => {
    if (theme) {
      if (!["light", "dark", "system"].includes(theme)) {
        setTheme("system")
      }
    }
  }, [theme, setTheme])

  const [activeAccentColor, setActiveAccentColor] = useState<AccentColorKey | null>(null)
  useEffect(() => {
    if (!instantAccount) return
    if (activeAccentColor !== null) return
    setActiveAccentColor(instantAccount.app_config?.accent_color ?? "sml-gold")
  }, [instantAccount, activeAccentColor, setActiveAccentColor])

  const selectedAccentColor: AccentColorKey = instantAccount?.app_config?.accent_color ?? "sml-gold"
  const selectedAccentColorOption = accentColorOptions.find((o) => o.key === selectedAccentColor)
  const handleAccentColorSelect = (key: AccentColorKey) => {
    if (!instantAccount) return
    const { data } = parseAccountUpdateInput({ app_config: { accent_color: key } })
    db.transact(db.tx.accounts[instantAccount?.id].merge(data))
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <p className={typography({ type: "label", className: "p-4" })}>Theme</p>
      </div>
      <Select
        aria-label="Select Accent Color"
        selectedKey={selectedAccentColor}
        onSelectionChange={(key) => handleAccentColorSelect(key as AccentColorKey)}
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
                items={accentColorOptions}
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
                      <div className={cn("size-12 rounded-full", option.bgClassName)} />
                      <span>{option.label}</span>
                    </ListBoxItem>
                  )
                }}
              </ListBox>
            </SelectPopover>
          </>
        )}
      </Select>
      <Select
        aria-label="Select Theme"
        selectedKey={theme}
        onSelectionChange={(key) => setTheme(key as string)}
        classNames={{
          base: "flex flex-col gap-2 p-4",
          button: {
            base: "border py-4 px-8 gap-8",
            value: "flex items-center gap-4 font-medium",
          },
          popover: "bg-base-bg rounded-sm border-2 p-4 w-(--trigger-width) max-h-300 overflow-auto",
        }}
      >
        {(_, classNames) => (
          <>
            <SelectButton classNames={classNames.button}>
              {({ selectedItem }) => {
                const selectedTheme = selectedItem as ThemeOption
                const ThemeIcon = selectedTheme?.icon ?? Laptop2Icon
                return (
                  <>
                    <Icon icon={<ThemeIcon />} variants={{ size: "sm" }} />
                    <span>{selectedTheme?.label}</span>
                    {selectedTheme?.key === "system" ? <span>({resolvedTheme})</span> : null}
                  </>
                )
              }}
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
                      <Icon icon={<option.icon />} variants={{ size: "sm" }} />
                      <span>{option.label}</span>
                    </ListBoxItem>
                  )
                }}
              </ListBox>
            </SelectPopover>
          </>
        )}
      </Select>
      {activeAccentColor !== selectedAccentColor && (
        <span className={cn("p-8 text-sm font-medium", selectedAccentColorOption?.textClassName)}>
          Refresh page to apply new color!
        </span>
      )}
    </div>
  )
}
