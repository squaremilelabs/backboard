"use client"
import { Emoji, EmojiStyle } from "emoji-picker-react"
import ScopePanel from "./scope-panel"
import { Modal, ModalTrigger } from "~/smui/modal/components"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { typography } from "@/common/components/class-names"
import { useDBQuery } from "@/database/db-client"

export function ScopeTitle({ scopeId }: { scopeId: string | null | undefined }) {
  const { scopes } = useDBQuery(
    "scopes",
    scopeId
      ? {
          $: { where: { id: scopeId }, first: 1 },
        }
      : null
  )
  const scope = scopes?.[0]

  return (
    <ModalTrigger>
      <Button
        className="flex max-w-full items-center gap-8 truncate p-2 text-left"
        variants={{ hover: "fill" }}
      >
        {!!(scope?.icon?.type === "emoji") && (
          <Icon
            icon={<Emoji unified={scope.icon.unified} emojiStyle={EmojiStyle.APPLE} />}
            variants={{ size: "lg" }}
          />
        )}
        <h1 className="text-neutral-text truncate text-lg font-semibold">
          {scope?.title || "..."}
        </h1>
        {scope?.is_inactive && <span className={typography({ type: "label" })}>INACTIVE</span>}
      </Button>
      <Modal isDismissable variants={{ size: "sm" }}>
        {!!scope && <ScopePanel scope={scope} />}
      </Modal>
    </ModalTrigger>
  )
}
