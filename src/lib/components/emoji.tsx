"use client"

import { EmojiClickData, EmojiStyle, Theme as EmojiTheme } from "emoji-picker-react"
import { CircleIcon, LucideIcon } from "lucide-react"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import { Button } from "~/smui/button/components"
import { Icon, IconProps } from "~/smui/icon/components"
import { IconVariantProps } from "~/smui/icon/variants"
import { Popover, PopoverTrigger } from "~/smui/popover/components"
import { ClassValue, cn } from "~/smui/utils"

const EmojiPickerDynamic = dynamic(() => import("emoji-picker-react"), { ssr: false })

const EmojiDynamic = dynamic(() => import("emoji-picker-react").then((mod) => mod.Emoji), {
  ssr: false,
})

export function EmojiIcon({ emoji, ...props }: { emoji: string | null } & Omit<IconProps, "icon">) {
  return emoji ? (
    <Icon icon={<EmojiDynamic unified={emoji} emojiStyle={EmojiStyle.APPLE} />} {...props} />
  ) : null
}

export function EmojiPicker({
  selected,
  FallbackIcon = CircleIcon,
  onSelectionChange,
  iconVariants,
  iconClassName,
}: {
  selected: string | null
  FallbackIcon?: LucideIcon
  onSelectionChange: (data: EmojiClickData) => void
  iconVariants: IconVariantProps
  iconClassName?: ClassValue
}) {
  const { resolvedTheme } = useTheme()
  const emojiTheme = resolvedTheme === "dark" ? EmojiTheme.DARK : EmojiTheme.LIGHT

  return (
    <PopoverTrigger>
      <Button className={cn("cursor-pointer hover:opacity-70")}>
        {selected ? (
          <EmojiIcon emoji={selected} variants={iconVariants} className={iconClassName} />
        ) : (
          <Icon icon={<FallbackIcon />} variants={iconVariants} className={iconClassName} />
        )}
      </Button>
      <Popover placement="bottom left">
        <EmojiPickerDynamic
          onEmojiClick={onSelectionChange}
          theme={emojiTheme}
          emojiStyle={EmojiStyle.APPLE}
        />
      </Popover>
    </PopoverTrigger>
  )
}
