"use client"
import React from "react"
import { Emoji } from "emoji-picker-react"
import { FolderIcon } from "lucide-react"
import { useCurrentInboxView } from "../inbox-views"
import InboxPanel from "../inbox-panel"
import { Inbox, useInboxQuery } from "@/database/models/inbox"
import { cn } from "~/smui/utils"
import { Modal, ModalTrigger } from "~/smui/modal/components"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"

export function InboxLayout({ children }: { children: React.ReactNode }) {
  const { id: inboxId } = useCurrentInboxView()

  const inboxQuery = useInboxQuery({
    $: { where: { id: inboxId }, first: 1 },
  })
  const inbox = inboxQuery.data?.[0]

  return (
    <div className="flex w-full flex-col">
      <div
        className={cn("sticky top-0 z-10 flex w-full flex-col", "bg-base-bg/30 backdrop-blur-2xl")}
      >
        <div className="flex items-center p-8">
          <InboxTitlePanelTrigger inbox={inbox} />
        </div>
      </div>
      <div className="relative flex w-full flex-col">{children}</div>
    </div>
  )
}

function InboxTitlePanelTrigger({ inbox }: { inbox: Inbox | null | undefined }) {
  return (
    <ModalTrigger>
      <Button className="flex items-center gap-8 p-8" variants={{ hover: "fill" }}>
        <Icon
          icon={inbox?.emoji ? <Emoji unified={inbox.emoji} /> : <FolderIcon />}
          variants={{ size: "lg" }}
          className={["text-neutral-muted-text"]}
        />
        <h1 className="text-neutral-text text-lg font-semibold">{inbox?.title || "..."}</h1>
      </Button>
      <Modal isDismissable classNames={{ content: "w-600 bg-base-bg/30 backdrop-blur-xl" }}>
        {!!inbox && <InboxPanel inbox={inbox} />}
      </Modal>
    </ModalTrigger>
  )
}
