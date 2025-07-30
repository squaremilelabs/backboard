"use client"

import { PlusIcon } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "~/smui/button/components"
import { Icon, IconProps } from "~/smui/icon/components"
import { TextField, TextFieldInput, TextFieldProps } from "~/smui/text-field/components"

export function CreateField({
  onSubmit,
  placeholder = "Add",
  classNames,
  iconProps,
}: {
  placeholder?: string
  onSubmit: (value: string) => Promise<void>
  classNames?: TextFieldProps["classNames"]
  iconProps?: Partial<IconProps>
}) {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !!value.trim()) {
      onSubmit(value.trim()).then(() => setValue(""))
    }
    if (event.key === "Escape") {
      setValue("")
      inputRef.current?.blur()
    }
  }

  return (
    <TextField
      aria-label="Create Field"
      value={value}
      onChange={setValue}
      onKeyDown={onKeyDown}
      classNames={{
        ...classNames,
        base: [
          "flex items-stretch w-full",
          "rounded-sm gap-4 p-8",
          "focus-within:outline-2",
          "not-focus-within:hover:bg-neutral-muted-bg/50",
          classNames?.base,
        ],
        input: ["!outline-0 w-full", classNames?.input],
      }}
    >
      {(_, innerClassNames) => (
        <>
          <Button
            excludeFromTabOrder
            onPress={() => inputRef.current?.focus()}
            className={"!outline-0"}
          >
            <Icon icon={<PlusIcon />} {...iconProps} />
          </Button>
          <TextFieldInput
            placeholder={placeholder}
            forwardRef={inputRef}
            className={innerClassNames.input}
          />
        </>
      )}
    </TextField>
  )
}
