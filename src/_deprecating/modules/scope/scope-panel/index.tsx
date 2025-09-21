"use client"

import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react"
import { ScopeIconPicker } from "../scope-icon-picker"
import {
  TitleContentFields,
  TitleContentFieldValues,
} from "@/_deprecating/common/components/title-content-fields"
import { palette, panel } from "@/_deprecating/common/components/class-names"
import { Button } from "@/_deprecating/common/primitives/button/components"
import { Icon } from "@/_deprecating/common/primitives/icon/components"
import { parseScopeUpdateInput, Scope } from "@/database/models/scope"
import { db } from "@/database/db-client"

export default function ScopePanel({ scope }: { scope: Scope }) {
  const { base, section } = panel()
  const onInactivate = () => {
    db.transact(db.tx.scopes[scope.id].update({ is_inactive: !scope.is_inactive }))
  }

  const onTitleContentSave = (values: Partial<TitleContentFieldValues>) => {
    const { data } = parseScopeUpdateInput(values)
    db.transact(db.tx.scopes[scope.id].update(data))
  }
  return (
    <div className={base()}>
      <TitleContentFields
        initialValues={{ title: scope.title, content: scope.content || null }}
        handleSaveValues={onTitleContentSave}
        titleStartContent={<ScopeIconPicker scope={scope} />}
      />
      <div className={section()}>
        <Button
          variants={{ variant: "action-button" }}
          className={[palette({ p: scope.is_inactive ? "base-flat" : "neutral-muted-flat" })]}
          onPress={onInactivate}
        >
          <Icon icon={scope.is_inactive ? <ArchiveRestoreIcon /> : <ArchiveIcon />} />
          {scope.is_inactive ? "Make active" : "Make inactive"}
        </Button>
      </div>
    </div>
  )
}
