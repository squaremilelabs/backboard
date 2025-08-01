"use client"

import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react"
import { InboxIconPicker } from "../inbox-icon-picker"
import { TitleContentFields } from "@/common/components/title-content-fields"
import { palette, panel } from "@/common/components/class-names"
import { Inbox, updateInbox } from "@/database/models/inbox"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"

export default function InboxPanel({ inbox }: { inbox: Inbox }) {
  const { base, section } = panel()
  const onArchive = () => {
    updateInbox(inbox.id, { is_archived: !inbox.is_archived })
  }
  return (
    <div className={base()}>
      <TitleContentFields
        initialValues={{ title: inbox.title, content: inbox.content || null }}
        handleSaveValues={(values) => updateInbox(inbox.id, values)}
        titleStartContent={<InboxIconPicker inbox={inbox} />}
      />
      <div className={section()}>
        <Button
          variants={{ variant: "action-button" }}
          className={[palette({ p: inbox.is_archived ? "base-flat" : "neutral-muted-flat" })]}
          onPress={onArchive}
        >
          <Icon icon={inbox.is_archived ? <ArchiveRestoreIcon /> : <ArchiveIcon />} />
          {inbox.is_archived ? "Restore" : "Archive"}
        </Button>
      </div>
    </div>
  )
}
