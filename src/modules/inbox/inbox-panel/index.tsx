"use client"
import { InboxEmojiPicker } from "../inbox-emoji-picker"
import { TitleContentFields } from "@/common/components/title-content-fields"
import { panel } from "@/common/components/variants"
import { Inbox, updateInbox } from "@/database/models/inbox"
import { Button } from "~/smui/button/components"

export default function InboxPanel({ inbox }: { inbox: Inbox }) {
  return (
    <div className={panel()}>
      <TitleContentFields
        initialValues={{ title: inbox.title, content: inbox.content || null }}
        handleSaveValues={(values) => updateInbox(inbox.id, values)}
        titleStartContent={<InboxEmojiPicker inbox={inbox} />}
      />
      <div className={"p-12"}>
        <Button>Archive</Button>
      </div>
    </div>
  )
}
