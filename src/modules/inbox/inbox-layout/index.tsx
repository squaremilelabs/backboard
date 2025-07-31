"use client"
import React from "react"
import { Emoji } from "emoji-picker-react"
import { useCurrentInboxView } from "../use-inbox-view"
import InboxPanel from "../inbox-panel"
import { InboxLayoutViewTabs } from "./view-tabs"
import { Inbox, useInboxQuery } from "@/database/models/inbox"
import { cn } from "~/smui/utils"
import { Modal, ModalTrigger } from "~/smui/modal/components"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { label } from "@/common/components/class-names"

export function InboxLayout({ children }: { children: React.ReactNode }) {
  const { id: inboxId } = useCurrentInboxView()

  const inboxQuery = useInboxQuery({ $: { where: { id: inboxId }, first: 1 } })
  const inbox = inboxQuery.data?.[0]

  return (
    <div className="divide-base-border/50 flex w-full flex-col divide-y">
      <div
        className={cn(
          "flex w-full flex-col items-start gap-8 p-16",
          "sticky top-0 z-10",
          "bg-base-bg/30 backdrop-blur-lg"
        )}
      >
        <InboxTitlePanelTrigger inbox={inbox} />
        <InboxLayoutViewTabs inbox={inbox} />
      </div>
      <div className="relative flex w-full flex-col p-16">{children}</div>
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
        {!!inbox?.emoji && (
          <Icon icon={<Emoji unified={inbox.emoji} />} variants={{ size: "lg" }} />
        )}
        <h1 className="text-neutral-text truncate text-lg font-semibold">
          {inbox?.title || "..."}
        </h1>
        {inbox?.is_archived && <span className={label()}>ARCHIVED</span>}
      </Button>
      <Modal isDismissable variants={{ size: "sm" }}>
        {!!inbox && <InboxPanel inbox={inbox} />}
      </Modal>
    </ModalTrigger>
  )
}
