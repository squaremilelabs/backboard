"use client"

import { CheckIcon, PlusIcon } from "lucide-react"
import { useRef, useState } from "react"
import { Button, Input, TextField } from "react-aria-components"
import { ClassNameValue } from "tailwind-merge"
import { twm } from "@/lib/tailwind"
import { iconButton } from "./_class-names"

export function InsertItemField({
  onSubmit,
  className,
}: {
  onSubmit: (value: string) => void
  className?: ClassNameValue
}) {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (!value.trim()) return
    onSubmit(value)
    setValue("")
  }

  return (
    <TextField
      aria-label="Insert Item"
      value={value}
      onChange={setValue}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSubmit()
        }
      }}
      className={twm([
        "group/insert-item-field",
        "flex items-center",
        "rounded-md border-2 border-transparent",
        "hover:bg-neutral-muted-bg/70",
        "has-data-focus-visible:outline-2",
        className,
      ])}
    >
      {({}) => (
        <>
          <Button
            className={iconButton({ class: "group-focus-within/insert-item-field:text-base-text" })}
            onPress={() => inputRef.current?.focus()}
            excludeFromTabOrder
          >
            <PlusIcon />
          </Button>
          <Input
            ref={inputRef}
            placeholder="Add item"
            className={twm(["px-space-xs grow", "!outline-0"])}
          />
          {value.trim() && (
            <Button className={iconButton({ class: "text-base-text" })} onPress={handleSubmit}>
              <CheckIcon />
            </Button>
          )}
        </>
      )}
    </TextField>
  )
}
