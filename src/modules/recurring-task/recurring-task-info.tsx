import React, { useEffect, useState } from "react"
import { Form, Group, Input, Label, NumberField } from "react-aria-components"
import { MinusIcon, PlusIcon } from "lucide-react"
import { useCurrentInboxView } from "../inbox/inbox-views"
import {
  createRecurringTask,
  RecurringTask,
  RecurringTaskFrequency,
  updateRecurringTask,
} from "@/database/models/recurring-task"
import { Modal, ModalTrigger } from "~/smui/modal/components"
import { TextField, TextFieldInput, TextFieldTextArea } from "~/smui/text-field/components"
import { FieldLabel } from "~/smui/field/components"
import { Select, SelectButton, SelectPopover } from "~/smui/select/components"
import { ListBox, ListBoxItem } from "~/smui/list-box/components"
import { ToggleButton, ToggleButtonGroup } from "~/smui/toggle-button/components"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { Checkbox } from "~/smui/checkbox/components"

// TODO: Separate create vs edit components
export function RecurringTaskModal({
  existingTask,
  children,
}: {
  existingTask?: RecurringTask
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { id: inboxId } = useCurrentInboxView()
  const [values, setValues] = useState<Pick<RecurringTask, "title" | "content" | "frequency">>({
    title: "",
    content: "",
    frequency: { type: "daily" },
  })

  useEffect(() => {
    if (existingTask) {
      setValues({
        title: existingTask.title,
        content: existingTask.content,
        frequency: existingTask.frequency,
      })
    }
  }, [existingTask])

  const handleFrequencyTypeChange = (type: RecurringTaskFrequency["type"]) => {
    if (type === "daily") {
      setValues({
        ...values,
        frequency: { type: "daily" },
      })
    }

    if (type === "weekly") {
      setValues({
        ...values,
        frequency: { type: "weekly", weekday: 1 }, // Default to Monday
      })
    }

    if (type === "monthly") {
      setValues({
        ...values,
        frequency: { type: "monthly", day: 1 }, // Default to the 1st of the month
      })
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate values in state, end function early if invalid
    if (!values.title.trim()) return
    if (values.frequency.type === "weekly" && values.frequency.weekday === undefined) return
    if (
      values.frequency.type === "monthly" &&
      (values.frequency.day < 1 || values.frequency.day > 31)
    )
      return

    // Handle update existing logic

    if (existingTask) {
      updateRecurringTask(existingTask.id, {
        title: values.title,
        content: values.content || "",
        frequency: values.frequency,
      }).then(() => {
        setOpen(false)
      })
    } else {
      createRecurringTask({
        inbox_id: inboxId,
        title: values.title,
        content: values.content || "",
        frequency: values.frequency,
      }).then(() => {
        setOpen(false)
        setValues({ title: "", content: "", frequency: { type: "daily" } })
      })
    }
  }

  const handleArchive = () => {
    if (existingTask) {
      updateRecurringTask(existingTask.id, { is_archived: true }).then(() => {
        setOpen(false)
      })
    }
  }

  return (
    <ModalTrigger isOpen={open} onOpenChange={setOpen}>
      {children}
      <Modal
        isDismissable
        classNames={{
          overlay: [
            "fixed inset-0 z-60 h-dvh w-dvw",
            "flex flex-col items-center pt-[10dvh]",
            "bg-canvas-1/30 backdrop-blur-xs",
          ],
          modal: ["bg-canvas-0 border"],
          content: ["p-16", "flex flex-col gap-16", "w-400"],
        }}
      >
        <Form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <TextField
            aria-label="Title"
            name="title"
            value={values.title}
            onChange={(value) => setValues({ ...values, title: value })}
            autoFocus
            classNames={{
              base: "flex flex-col gap-2",
              input: "w-full p-8 border bg-canvas-0",
              field: {
                label: "text-sm font-semibold text-canvas-5",
              },
            }}
          >
            {(_, classNames) => (
              <>
                <FieldLabel className={classNames.field.label}>Title</FieldLabel>
                <TextFieldInput className={classNames.input} />
              </>
            )}
          </TextField>
          <TextField
            aria-label="Content"
            name="content"
            value={values.content}
            onChange={(value) => setValues({ ...values, content: value })}
            classNames={{
              base: "flex flex-col gap-2",
              textarea: "w-full p-8 border bg-canvas-0 resize-none",
              field: {
                label: "text-sm font-semibold text-canvas-5",
              },
            }}
          >
            {(_, classNames) => (
              <>
                <FieldLabel className={classNames.field.label}>Content</FieldLabel>
                <TextFieldTextArea className={classNames.textarea} spellCheck={false} minRows={3} />
              </>
            )}
          </TextField>
          <div className="flex flex-col gap-2">
            <span className="text-canvas-5 text-sm font-semibold">Frequency</span>
            <ToggleButtonGroup
              selectedKeys={[values.frequency.type]}
              selectionMode="single"
              onSelectionChange={(keys) => {
                const type = [...keys][0] as RecurringTaskFrequency["type"]
                handleFrequencyTypeChange(type)
              }}
              classNames={{
                base: "flex items-center gap-4",
                button: [
                  "grow p-4 border text-sm",
                  "cursor-pointer hover:bg-canvas-1",
                  "data-selected:bg-canvas-3",
                  "data-selected:text-canvas-0",
                  "data-selected:font-medium",
                ],
              }}
            >
              {(renderProps, classNames) => (
                <>
                  <ToggleButton id="daily" className={classNames.button}>
                    Daily
                  </ToggleButton>
                  <ToggleButton id="weekly" className={classNames.button}>
                    Weekly
                  </ToggleButton>
                  <ToggleButton id="monthly" className={classNames.button}>
                    Monthly
                  </ToggleButton>
                </>
              )}
            </ToggleButtonGroup>
          </div>
          {values.frequency.type === "daily" && (
            <Checkbox
              isSelected={values.frequency.skip_weekends === true}
              onChange={(value) =>
                setValues({ ...values, frequency: { type: "daily", skip_weekends: value } })
              }
              classNames={{
                base: [
                  "flex items-center py-4 gap-4 cursor-pointer text-canvas-4",
                  "data-selected:text-canvas-7",
                  "hover:text-canvas-4",
                ],
                icon: "size-20",
              }}
            >
              Skip weekends
            </Checkbox>
          )}
          {values.frequency.type === "weekly" && (
            <Select
              selectedKey={values.frequency.weekday}
              onSelectionChange={(key) =>
                setValues({ ...values, frequency: { type: "weekly", weekday: key as number } })
              }
              placeholder="Select Day"
              classNames={{
                base: "flex flex-col gap-2",
                button: {
                  base: "flex items-center p-8 border cursor-pointer",
                  value: "text-left grow",
                  icon: "size-16",
                },
                field: {
                  label: "text-sm font-semibold text-canvas-5",
                },
                popover: "w-(--trigger-width) bg-canvas-0 border",
              }}
            >
              {(_, classNames) => (
                <>
                  <FieldLabel className={classNames.field.label}>Day of Week</FieldLabel>
                  <SelectButton classNames={classNames.button}>
                    {({ defaultChildren }) => defaultChildren}
                  </SelectButton>
                  <SelectPopover className={classNames.popover}>
                    <ListBox
                      items={WEEKDAY_OPTIONS}
                      classNames={{
                        base: [],
                        item: [
                          "cursor-pointer hover:bg-canvas-1",
                          "px-8 py-4",
                          "data-selected:bg-canvas-3 data-selected:text-canvas-0 data-selected:font-medium",
                        ],
                      }}
                    >
                      {(item, classNames) => (
                        <ListBoxItem
                          id={item.value}
                          textValue={item.label}
                          className={classNames.item}
                        >
                          {item.label}
                        </ListBoxItem>
                      )}
                    </ListBox>
                  </SelectPopover>
                </>
              )}
            </Select>
          )}
          {values.frequency.type === "monthly" && (
            // TODO: Update to SMUI
            <NumberField
              value={values.frequency.day}
              onChange={(value) => {
                setValues({ ...values, frequency: { type: "monthly", day: value } })
              }}
              minValue={1}
              maxValue={31}
            >
              <Label className={"text-canvas-5 text-sm font-semibold"}>Day of Month</Label>
              <Group className="flex items-stretch">
                <Button
                  slot="decrement"
                  className="bg-canvas-2 cursor-pointer border px-4 hover:opacity-80"
                >
                  <Icon icon={<MinusIcon />} />
                </Button>
                <Input className="w-100 border p-4 text-center" />
                <Button
                  slot="increment"
                  className="bg-canvas-2 cursor-pointer border px-4 hover:opacity-80"
                >
                  <Icon icon={<PlusIcon />} />
                </Button>
              </Group>
            </NumberField>
          )}
          <Button
            className="bg-canvas-2 text-canvas-7 cursor-pointer p-8 font-medium hover:opacity-80"
            type="submit"
          >
            Save
          </Button>
          {existingTask ? (
            <Button
              className="text-canvas-3 cursor-pointer text-left text-sm hover:underline"
              onPress={handleArchive}
            >
              Archive
            </Button>
          ) : null}
        </Form>
      </Modal>
    </ModalTrigger>
  )
}

const WEEKDAY_OPTIONS = [
  { value: 0, label: "Sundays" },
  { value: 1, label: "Mondays" },
  { value: 2, label: "Tuesdays" },
  { value: 3, label: "Wednesdays" },
  { value: 4, label: "Thursdays" },
  { value: 5, label: "Fridays" },
  { value: 6, label: "Saturdays" },
]
