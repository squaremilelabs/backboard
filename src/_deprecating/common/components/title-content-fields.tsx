"use client"
import { TextIcon } from "lucide-react"
import { useEffect } from "react"
import { useDebouncedTypings } from "../utils/use-debounced"
import { TextEditor } from "./text-editor"
import { Icon } from "~/smui/icon/components"
import { TextField, TextFieldTextArea } from "~/smui/text-field/components"

export type TitleContentFieldValues = {
  title: string
  content: string | null | undefined
}

export function TitleContentFields({
  initialValues,
  handleSaveValues,
  saveDelay = 500,
  titleStartContent,
}: {
  initialValues: TitleContentFieldValues
  handleSaveValues: (values: Partial<TitleContentFieldValues>) => void
  saveDelay?: number
  titleStartContent?: React.ReactNode
}) {
  const {
    typedValue: title,
    setTypedValue: setTitle,
    settledValue: settledTitle,
  } = useDebouncedTypings(initialValues.title, saveDelay)

  useEffect(() => {
    handleSaveTitle(settledTitle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settledTitle])

  const handleSaveTitle = (title: string) => {
    if (!title.trim()) return
    handleSaveValues({ title: title.trim() })
  }

  return (
    <div className="bg-base-bg flex w-full grow flex-col gap-12 rounded-sm p-12">
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
            handleSaveTitle(title)
          } else if (e.key === "Escape") {
            handleSaveTitle(title)
            e.continuePropagation()
          } else {
            e.continuePropagation()
          }
        }}
        onBlur={() => handleSaveTitle(title)}
        value={title}
        onChange={(title) => setTitle(title)}
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
      <div className="flex items-start gap-8">
        <Icon icon={<TextIcon />} className="text-neutral-muted-text w-24" />
        <div className="max-h-400 grow overflow-auto">
          <TextEditor
            initialContent={initialValues?.content || null}
            handleSaveContent={(content) => handleSaveValues({ content })}
            saveDelay={saveDelay}
          />
        </div>
      </div>
    </div>
  )
}
