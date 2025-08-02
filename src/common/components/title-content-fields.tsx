"use client"

import { TextIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useDebounceCallback } from "usehooks-ts"
import { Icon } from "~/smui/icon/components"
import { TextField, TextFieldTextArea } from "~/smui/text-field/components"

export type TitleContentFieldValues = {
  title: string
  content: string | null | undefined
}

const isEqual = (a: TitleContentFieldValues, b: TitleContentFieldValues) => {
  return a.title === b.title && (a.content || null) === (b.content || null)
}

export function TitleContentFields({
  initialValues,
  handleSaveValues,
  saveDelay = 500,
  titleStartContent,
}: {
  initialValues: TitleContentFieldValues
  handleSaveValues: (values: TitleContentFieldValues) => void
  saveDelay?: number
  titleStartContent?: React.ReactNode
}) {
  const [typedValues, setTypedValues] = useState<TitleContentFieldValues>(initialValues)
  const [persistedValues, setPersistedValues] = useState<TitleContentFieldValues>(initialValues)
  const debouncedSetPersistedValues = useDebounceCallback(setPersistedValues, saveDelay)

  const validateThenSaveValues = (values: TitleContentFieldValues) => {
    if (!values.title.trim()) return
    if (isEqual(values, initialValues)) return
    handleSaveValues({ title: values.title.trim(), content: values.content?.trim() || null })
  }

  useEffect(() => {
    debouncedSetPersistedValues(typedValues)
  }, [typedValues, debouncedSetPersistedValues])

  useEffect(() => {
    validateThenSaveValues(persistedValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only want to run this when persistedValues change
  }, [persistedValues])

  return (
    <div className="bg-base-bg flex w-full flex-col gap-12 rounded-sm p-12">
      <TextField
        aria-label="Title"
        autoFocus
        classNames={{
          base: "flex items-start w-full gap-8",
          textarea: "text-lg w-full !outline-0 font-medium",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            validateThenSaveValues(typedValues)
          } else if (e.key === "Escape") {
            validateThenSaveValues(typedValues)
            e.continuePropagation()
          } else {
            e.continuePropagation()
          }
        }}
        onBlur={() => validateThenSaveValues(typedValues)}
        value={typedValues.title}
        onChange={(title) => setTypedValues((prev) => ({ ...prev, title }))}
        isRequired
      >
        {(_, classNames) => (
          <>
            {titleStartContent}
            <TextFieldTextArea
              className={classNames.textarea}
              minRows={1}
              placeholder="Title"
              spellCheck={false}
            />
          </>
        )}
      </TextField>
      <TextField
        aria-label="Content"
        classNames={{
          base: "flex items-start w-full gap-8",
          textarea: "w-full !outline-0",
        }}
        value={typedValues.content || ""}
        onChange={(content) => setTypedValues((prev) => ({ ...prev, content: content || null }))}
        onBlur={() => validateThenSaveValues(typedValues)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            validateThenSaveValues(typedValues)
          }
          e.continuePropagation()
        }}
        name="content"
        isRequired
      >
        {(_, classNames) => (
          <>
            <Icon icon={<TextIcon />} className="text-neutral-muted-text w-24" />
            <TextFieldTextArea
              className={classNames.textarea}
              minRows={5}
              placeholder="Notes..."
              spellCheck={false}
            />
          </>
        )}
      </TextField>
    </div>
  )
}
