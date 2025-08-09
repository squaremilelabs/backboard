"use client"
import EmojiPicker, {
  Emoji,
  EmojiClickData,
  EmojiStyle,
  Theme as EmojiTheme,
} from "emoji-picker-react"
import { CircleChevronDownIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Icon } from "~/smui/icon/components"
import { Button } from "~/smui/button/components"
import { Popover, PopoverTrigger } from "~/smui/popover/components"
import { parseScopeUpdateInput, Scope } from "@/database/models/scope"
import { db } from "@/database/db-client"

export function ScopeIconPicker({ scope }: { scope: Scope }) {
  const [open, setOpen] = useState(false)
  const { resolvedTheme } = useTheme()

  const handleSelect = (emoji: EmojiClickData) => {
    const { data } = parseScopeUpdateInput({
      icon: { type: "emoji", unified: emoji.unified, char: emoji.emoji },
    })
    db.transact(db.tx.scopes[scope.id].update(data))
    setOpen(false)
  }

  const handleRemove = () => {
    db.transact(db.tx.scopes[scope.id].update({ icon: null }))
    setOpen(false)
  }

  return (
    <PopoverTrigger isOpen={open} onOpenChange={setOpen}>
      <Button>
        <Icon
          icon={
            scope.icon?.type === "emoji" ? (
              <Emoji unified={scope.icon.unified} emojiStyle={EmojiStyle.APPLE} />
            ) : (
              <CircleChevronDownIcon />
            )
          }
          variants={{ size: "lg" }}
          className="text-neutral-muted-text"
        />
      </Button>
      <Popover
        placement="bottom left"
        offset={4}
        classNames={{ content: ["flex flex-col", "p-8 border bg-base-bg rounded-sm"] }}
      >
        {scope.icon?.type === "emoji" ? (
          <Button
            className="text-neutral-muted-text flex items-center self-start p-8"
            onPress={handleRemove}
          >
            <Icon icon={<XIcon />} />
            Remove icon
          </Button>
        ) : null}
        <EmojiPicker
          previewConfig={{ showPreview: false }}
          onEmojiClick={handleSelect}
          className="!border-0 !p-0"
          emojiStyle={EmojiStyle.APPLE}
          theme={resolvedTheme === "dark" ? EmojiTheme.DARK : undefined}
        />
      </Popover>
    </PopoverTrigger>
  )
}
