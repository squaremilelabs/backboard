import { PlusIcon } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { TextField, TextFieldInput } from "~/smui/text-field/components"
import { TextFieldClassNames } from "~/smui/text-field/variants"
import { ClassValue } from "~/smui/utils"

export function CreateField({
  onSubmit,
  placeholder = "Add",
  classNames,
}: {
  placeholder?: string
  onSubmit: (value: string) => Promise<void>
  classNames?: Partial<TextFieldClassNames & { icon: ClassValue }>
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
          "gap-4 px-8",
          "focus-within:outline-2 rounded-sm",
          classNames?.base,
        ],
        input: ["py-6 !outline-0 w-full", classNames?.input],
      }}
    >
      {(_, innerClassNames) => (
        <>
          <Button
            excludeFromTabOrder
            onPress={() => inputRef.current?.focus()}
            className={"!outline-0"}
          >
            <Icon icon={<PlusIcon />} className={classNames?.icon} />
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
