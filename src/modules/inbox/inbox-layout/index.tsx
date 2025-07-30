"use client"
import React from "react"
import { Emoji } from "emoji-picker-react"
import { FolderIcon } from "lucide-react"
import { useCurrentInboxView } from "../inbox-views"
import InboxPanel from "../inbox-panel"
import { InboxLayoutViewTabs } from "./view-tabs"
import { Inbox, useInboxQuery } from "@/database/models/inbox"
import { cn } from "~/smui/utils"
import { Modal, ModalTrigger } from "~/smui/modal/components"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"

export function InboxLayout({ children }: { children: React.ReactNode }) {
  const { id: inboxId } = useCurrentInboxView()

  const inboxQuery = useInboxQuery({ $: { where: { id: inboxId }, first: 1 } })
  const inbox = inboxQuery.data?.[0]

  return (
    <div className="flex w-full flex-col">
      <div
        className={cn(
          "flex w-full flex-col items-start gap-8 p-16",
          "sticky top-0 z-10",
          "bg-base-bg/50 backdrop-blur-2xl"
        )}
      >
        <InboxTitlePanelTrigger inbox={inbox} />
        <InboxLayoutViewTabs inbox={inbox} />
      </div>
      <div className="relative flex w-full flex-col p-16 pt-0">{children}</div>
    </div>
  )
}

function InboxTitlePanelTrigger({ inbox }: { inbox: Inbox | null | undefined }) {
  return (
    <ModalTrigger>
      <Button
        className="flex max-w-full items-center gap-8 truncate p-2 text-left"
        variants={{ hover: "fill" }}
      >
        <Icon
          icon={inbox?.emoji ? <Emoji unified={inbox.emoji} /> : <FolderIcon />}
          variants={{ size: "lg" }}
          className={["text-neutral-muted-text"]}
        />
        <h1 className="text-neutral-text truncate text-lg font-semibold">
          {inbox?.title || "..."}
        </h1>
      </Button>
      <Modal isDismissable>{!!inbox && <InboxPanel inbox={inbox} />}</Modal>
    </ModalTrigger>
  )
}
