"use client"

import { InboxIconPicker } from "../inbox-icon-picker"
import { TitleContentFields } from "@/common/components/title-content-fields"
import { panel } from "@/common/components/class-names"
import { Inbox, updateInbox } from "@/database/models/inbox"
import { Button } from "~/smui/button/components"

export default function InboxPanel({ inbox }: { inbox: Inbox }) {
  const { base, section } = panel()
  return (
    <div className={base()}>
      <TitleContentFields
        initialValues={{ title: inbox.title, content: inbox.content || null }}
        handleSaveValues={(values) => updateInbox(inbox.id, values)}
        titleStartContent={<InboxIconPicker inbox={inbox} />}
      />
      <div className={section()}>
        <Button>Archive</Button>
      </div>
    </div>
  )
}
