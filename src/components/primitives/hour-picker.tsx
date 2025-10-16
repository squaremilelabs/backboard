"use client"

import {
  Button,
  ListBox,
  ListBoxItem,
  Select,
  SelectProps,
  SelectValue,
} from "react-aria-components"
import { twm } from "@/lib/tailwind"
import { Overlay } from "./overlay"

export function HourPicker({
  min,
  max,
  allowEmpty,
  ...props
}: {
  min?: number
  max?: number
  allowEmpty?: boolean
} & Omit<SelectProps, "children">) {
  const displayedOptions = hourOptions.filter((option) => {
    if (option.value === "empty") {
      if (allowEmpty) return true
      return false
    }
    if (min !== undefined && option.value < min) return false
    if (max !== undefined && option.value > max) return false
    return true
  })
  return (
    <Select placeholder="--" className="flex flex-col" {...props}>
      <>
        <Button className="px-space-lg py-space-md flex rounded-sm border">
          <SelectValue />
        </Button>
        <Overlay racType="popover">
          <ListBox items={displayedOptions} className={"flex flex-col overflow-auto"}>
            {(item) => {
              return (
                <ListBoxItem
                  id={item.value}
                  textValue={item.label}
                  className={twm(
                    "not-data-disabled:hover:bg-neutral-muted-bg not-data-disabled:cursor-pointer",
                    "text-neutral-text rounded-sm px-8 py-4",
                    "data-selected:text-base-text data-selected:border data-selected:font-medium"
                  )}
                >
                  {item.label}
                </ListBoxItem>
              )
            }}
          </ListBox>
        </Overlay>
      </>
    </Select>
  )
}

const hourOptions: { label: string; value: number | "empty" }[] = [
  { label: "--", value: "empty" },
  { label: "12 AM", value: 0 },
  { label: "1 AM", value: 1 },
  { label: "2 AM", value: 2 },
  { label: "3 AM", value: 3 },
  { label: "4 AM", value: 4 },
  { label: "5 AM", value: 5 },
  { label: "6 AM", value: 6 },
  { label: "7 AM", value: 7 },
  { label: "8 AM", value: 8 },
  { label: "9 AM", value: 9 },
  { label: "10 AM", value: 10 },
  { label: "11 AM", value: 11 },
  { label: "12 PM", value: 12 },
  { label: "1 PM", value: 13 },
  { label: "2 PM", value: 14 },
  { label: "3 PM", value: 15 },
  { label: "4 PM", value: 16 },
  { label: "5 PM", value: 17 },
  { label: "6 PM", value: 18 },
  { label: "7 PM", value: 19 },
  { label: "8 PM", value: 20 },
  { label: "9 PM", value: 21 },
  { label: "10 PM", value: 22 },
  { label: "11 PM", value: 23 },
  { label: "-> 12 AM", value: 24 }, // 12 AM next day
  { label: "-> 1 AM", value: 25 }, // 1 AM next day
  { label: "-> 2 AM", value: 26 }, // 2 AM next day
  { label: "-> 3 AM", value: 27 }, // 3 AM next day
  { label: "-> 4 AM", value: 28 }, // 4 AM next day
  { label: "-> 5 AM", value: 29 }, // 5 AM next day
  { label: "-> 6 AM", value: 30 }, // 6 AM next day
  { label: "-> 7 AM", value: 31 }, // 7 AM next day
  { label: "-> 8 AM", value: 32 }, // 8 AM next day
  { label: "-> 9 AM", value: 33 }, // 9 AM next day
  { label: "-> 10 AM", value: 34 }, // 10 AM next day
  { label: "-> 11 AM", value: 35 }, // 11 AM next day
]
