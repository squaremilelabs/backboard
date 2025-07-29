import { PlusIcon } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { TextField, TextFieldInput } from "~/smui/text-field/components"
import { TextFieldClassNames } from "~/smui/text-field/variants"

export function CreateInput({
  onSubmit,
  classNames,
}: {
  onSubmit: (value: string) => Promise<void>
  classNames?: TextFieldClassNames
}) {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !!value.trim()) {
      onSubmit(value.trim()).then(() => setValue(""))
    }
  }

  return (
    <TextField
      aria-label="Add by Title"
      value={value}
      onChange={setValue}
      onKeyDown={onKeyDown}
      classNames={{
        ...classNames,
        base: [
          "flex items-stretch w-full",
          "flex gap-4",
          "px-8",
          "focus-within:outline-2 rounded-sm",
          "w-full",
          classNames?.base,
        ],
        input: ["py-6 !outline-0 w-full", classNames?.input],
      }}
    >
      {(_, classNames) => (
        <>
          <Button
            excludeFromTabOrder
            onPress={() => inputRef.current?.focus()}
            className={"!outline-0"}
          >
            <Icon icon={<PlusIcon />} />
          </Button>
          <TextFieldInput forwardRef={inputRef} className={classNames.input} placeholder="Add" />
        </>
      )}
    </TextField>
  )
}
