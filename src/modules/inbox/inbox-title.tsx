"use client"
import { Emoji } from "emoji-picker-react"
import InboxPanel from "./inbox-panel"
import { useInboxQuery } from "@/database/models/inbox"
import { Modal, ModalTrigger } from "~/smui/modal/components"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { typography } from "@/common/components/class-names"

export function InboxTitle({ inboxId }: { inboxId: string | null | undefined }) {
  const inboxQuery = useInboxQuery(inboxId ? { $: { where: { id: inboxId }, first: 1 } } : null)
  const inbox = inboxQuery.data?.[0]

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
        {inbox?.is_archived && <span className={typography({ type: "label" })}>ARCHIVED</span>}
      </Button>
      <Modal isDismissable variants={{ size: "sm" }}>
        {!!inbox && <InboxPanel inbox={inbox} />}
      </Modal>
    </ModalTrigger>
  )
}
