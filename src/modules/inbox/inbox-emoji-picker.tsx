"use client"
import EmojiPicker, {
  Emoji,
  EmojiClickData,
  EmojiStyle,
  Theme as EmojiTheme,
} from "emoji-picker-react"
import { FolderIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Inbox, updateInbox } from "@/database/models/inbox"
import { Icon } from "~/smui/icon/components"
import { Button } from "~/smui/button/components"
import { Popover, PopoverTrigger } from "~/smui/popover/components"

export function InboxEmojiPicker({ inbox }: { inbox: Inbox }) {
  const [open, setOpen] = useState(false)
  const { resolvedTheme } = useTheme()

  const handleSelect = (emoji: EmojiClickData) => {
    updateInbox(inbox.id, { emoji: emoji.unified })
    setOpen(false)
  }

  const handleRemove = () => {
    updateInbox(inbox.id, { emoji: null })
    setOpen(false)
  }

  return (
    <PopoverTrigger isOpen={open} onOpenChange={setOpen}>
      <Button>
        <Icon
          icon={inbox.emoji ? <Emoji unified={inbox.emoji} /> : <FolderIcon />}
          variants={{ size: "lg" }}
          className="text-neutral-muted-text"
        />
      </Button>
      <Popover
        placement="bottom left"
        offset={4}
        classNames={{ content: ["flex flex-col", "p-8 border bg-base-bg rounded-sm"] }}
      >
        {inbox.emoji ? (
          <Button
            className="text-neutral-muted-text flex items-center self-start p-8"
            onPress={handleRemove}
          >
            <Icon icon={<XIcon />} />
            Remove
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
