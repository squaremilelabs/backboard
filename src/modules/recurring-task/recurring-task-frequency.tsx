"use client"

import { useState } from "react"
import { Heading } from "react-aria-components"
import { CheckIcon, RefreshCwIcon, SquareCheckIcon, SquareIcon } from "lucide-react"
import { getRecurringTaskInfo, monthdayOptions, weekdayOptions } from "./recurring-task-info"
import { RecurringTaskFrequencyValues } from "./recurring-task-info"
import { RecurringTaskRecurDayType } from "@/database/models/recurring-task"
import { ListBox, ListBoxItem } from "~/smui/list-box/components"
import { Select, SelectButton, SelectPopover } from "~/smui/select/components"
import { Modal } from "~/smui/modal/components"
import { panel, typography } from "@/common/components/class-names"
import { cn } from "~/smui/utils"
import { ToggleButton, ToggleButtonGroup } from "~/smui/toggle-button/components"
import { Icon } from "~/smui/icon/components"
import { Button } from "~/smui/button/components"

export function RecurringTaskFrequencyPicker({
  isOpen,
  onOpenChange,
  initialValues,
  handleSaveValues,
}: {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  initialValues: RecurringTaskFrequencyValues
  handleSaveValues: (values: RecurringTaskFrequencyValues) => void
}) {
  const [values, setValues] = useState<RecurringTaskFrequencyValues>(initialValues)

  const { label: frequencyLabel, frequency } = getRecurringTaskInfo(values)

  const { base, section } = panel()

  const handleSave = () => {
    handleSaveValues(values)
    onOpenChange(false)
  }

  return (
    <Modal
      isDismissable
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      variants={{ size: "xs" }}
      classNames={{
        content: ["bg-base-bg border backdrop-blur-xl", "flex flex-col gap-8", base(), "w-xs"],
      }}
    >
      <Heading
        slot="title"
        className={cn(section(), "flex items-center gap-8 p-4 px-8 font-medium")}
      >
        Set Frequency...
      </Heading>
      <div className="bg-base-bg flex flex-col gap-4 rounded-sm p-4">
        <Select
          classNames={{
            button: {
              base: "cursor-pointer hover:bg-neutral-muted-bg flex items-center w-full p-8",
              value: "grow text-left font-medium",
              icon: "size-14",
            },
            popover: "bg-base-bg rounded-sm border p-4 w-(--trigger-width)",
          }}
          selectedKey={values.recur_day_type}
          disabledKeys={[values.recur_day_type]}
          onSelectionChange={(key) => {
            const selected = key as RecurringTaskRecurDayType
            if (selected === "monthday") {
              setValues({ recur_day_type: "monthday", recur_days: [1] })
            } else {
              setValues({ recur_day_type: "weekday", recur_days: [1, 2, 3, 4, 5] })
            }
          }}
        >
          {(_, classNames) => (
            <>
              <SelectButton classNames={classNames.button}>
                {({ defaultChildren }) => defaultChildren}
              </SelectButton>
              <SelectPopover className={classNames.popover}>
                <ListBox
                  items={[
                    { value: "weekday", label: "Daily or Weekly" },
                    { value: "monthday", label: "Monthly" },
                  ]}
                  classNames={{
                    base: [],
                    item: [
                      "not-data-disabled:cursor-pointer not-data-disabled:hover:bg-neutral-muted-bg",
                      "px-8 py-4 text-base-text font-medium",
                      "data-selected:text-neutral-muted-text data-selected:font-normal",
                    ],
                  }}
                >
                  {(item, classNames) => (
                    <ListBoxItem id={item.value} textValue={item.label} className={classNames.item}>
                      {item.label}
                    </ListBoxItem>
                  )}
                </ListBox>
              </SelectPopover>
            </>
          )}
        </Select>
        {values.recur_day_type === "weekday" && (
          <>
            <div className="flex flex-col gap-4 border-y py-4">
              <Button
                className={[
                  "flex items-center gap-4 px-8 py-4",
                  frequency === "daily" ? "text-neutral-text" : "text-neutral-muted-text",
                ]}
                variants={{ hover: "fill" }}
                onPress={() =>
                  setValues({ recur_day_type: "weekday", recur_days: [0, 1, 2, 3, 4, 5, 6] })
                }
              >
                <Icon icon={frequency === "daily" ? <SquareCheckIcon /> : <SquareIcon />} />
                Daily
              </Button>
              <Button
                className={[
                  "flex items-center gap-4 px-8 py-4",
                  frequency === "weekdays" ? "text-neutral-text" : "text-neutral-muted-text",
                ]}
                variants={{ hover: "fill" }}
                onPress={() =>
                  setValues({ recur_day_type: "weekday", recur_days: [1, 2, 3, 4, 5] })
                }
              >
                <Icon icon={frequency === "weekdays" ? <SquareCheckIcon /> : <SquareIcon />} />
                Every weekday
              </Button>
              <Button
                className={cn([
                  "flex items-center gap-4 px-8 py-4",
                  frequency !== "daily" && frequency !== "weekdays"
                    ? "text-neutral-text"
                    : "text-neutral-muted-text",
                ])}
                variants={{ hover: "fill" }}
                onPress={() => setValues({ recur_day_type: "weekday", recur_days: [1] })}
              >
                <Icon
                  icon={
                    frequency !== "daily" && frequency !== "weekdays" ? (
                      <SquareCheckIcon />
                    ) : (
                      <SquareIcon />
                    )
                  }
                />
                Weekly (selected days)
              </Button>
            </div>
            <ToggleButtonGroup
              disallowEmptySelection
              selectionMode="multiple"
              selectedKeys={values.recur_days}
              onSelectionChange={(selection) => {
                setValues({ ...values, recur_days: [...selection] as number[] })
              }}
              orientation="vertical"
              classNames={{
                base: "flex flex-col items-stretch gap-2",
                button: [
                  "flex items-center justify-between px-8 py-4 gap-8",
                  "text-neutral-muted-text",
                  "data-selected:text-base-text rounded-sm",
                  "!opacity-100 hover:bg-neutral-muted-bg",
                ],
              }}
            >
              {(_, classNames) => (
                <>
                  {weekdayOptions.map(({ value, label }) => {
                    return (
                      <ToggleButton key={value} id={value} className={classNames.button}>
                        {({ isSelected }) => {
                          return (
                            <>
                              {label}s
                              {isSelected && (
                                <Icon icon={<CheckIcon />} variants={{ size: "md" }} />
                              )}
                            </>
                          )
                        }}
                      </ToggleButton>
                    )
                  })}
                </>
              )}
            </ToggleButtonGroup>
          </>
        )}
        {values.recur_day_type === "monthday" && (
          <>
            <p className="text-neutral-muted-text px-4 pb-4 text-sm">Select days...</p>
            <ToggleButtonGroup
              disallowEmptySelection
              selectedKeys={values.recur_days}
              selectionMode="multiple"
              onSelectionChange={(selection) => {
                setValues({ ...values, recur_days: [...selection] as number[] })
              }}
              classNames={{
                base: "grid grid-cols-7 gap-2",
                button: [
                  "rounded-sm border border-transparent py-2",
                  "text-neutral-muted-text/50",
                  "hover:text-base-text",
                  "data-selected:border-base-border data-selected:text-base-text data-selected:font-medium",
                ],
              }}
            >
              {(_, classNames) => (
                <>
                  {monthdayOptions.map((value) => {
                    return (
                      <ToggleButton key={value} id={value} className={classNames.button}>
                        {value}
                      </ToggleButton>
                    )
                  })}
                </>
              )}
            </ToggleButtonGroup>
          </>
        )}
      </div>
      <div className={section({ className: ["flex items-center", "p-4", "gap-4"] })}>
        <Icon
          icon={<RefreshCwIcon />}
          variants={{ size: "sm" }}
          className="text-neutral-muted-text"
        />
        <div className={typography({ type: "label" })}>{frequencyLabel}</div>
        <div className="grow" />
        <Button
          onPress={handleSave}
          className="bg-neutral-muted-bg rounded-sm border px-8 py-4 font-medium"
        >
          Save
        </Button>
      </div>
    </Modal>
  )
}
