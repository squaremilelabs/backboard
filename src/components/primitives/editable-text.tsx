"use client"

import { CheckIcon, Undo2Icon, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button, DialogTrigger, Popover, Tooltip, TooltipTrigger } from "react-aria-components"
import TextareaAutosize from "react-textarea-autosize"
import { useResizeObserver } from "usehooks-ts"
import { twm } from "@/lib/tailwind"
import { iconButton, tooltip } from "./_class-names"

export function EditableText({
  value,
  onSubmit,
  isEditMode,
  setIsEditMode,
  disablePressToActivate = false,
}: {
  value: string
  onSubmit: (value: string) => void
  isEditMode: boolean
  setIsEditMode: (isEditMode: boolean) => void
  disablePressToActivate?: boolean
}) {
  const [innerValue, setInnerValue] = useState(value)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setInnerValue(value)
  }, [value])

  useEffect(() => {
    if (isEditMode) {
      inputRef.current?.focus()
    }
  }, [isEditMode])

  // @ts-expect-error - usehooks-ts docs allow for null refs
  const { height: buttonHeight } = useResizeObserver({ ref: buttonRef })

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      handleSubmit()
    }
    if (event.key === "Escape") {
      handleReset()
    }
  }

  const handleSubmit = () => {
    if (!innerValue.trim()) return
    onSubmit(innerValue)
    setIsEditMode(false)
  }

  const handleReset = () => {
    setInnerValue(value)
    setIsEditMode(false)
  }

  const hasChanges = value.trim() !== innerValue.trim()

  return (
    <DialogTrigger isOpen={isEditMode} onOpenChange={setIsEditMode}>
      <Button
        ref={buttonRef}
        className={twm(
          "py-space-md min-h-box-md px-space-xs grow",
          "flex items-center text-left",
          "!outline-0",
          hasChanges && "text-neutral-muted-text",
          isEditMode && "text-transparent"
        )}
        isDisabled={disablePressToActivate}
      >
        {isEditMode || hasChanges ? innerValue : value}
        {isEditMode && (
          // Placeholder to align button height with the popover buttons
          <div className="gap-space-sm px-space-md flex">
            <div className="w-box-sm" /> <div className="w-box-sm" />
          </div>
        )}
      </Button>
      <Popover
        className={twm("bg-base-bg flex items-start !outline-0", "w-(--trigger-width)")}
        style={{ height: buttonHeight, translate: `0 ${buttonHeight}px` }}
        offset={0}
        placement="top"
        containerPadding={0}
      >
        <TextareaAutosize
          autoFocus
          ref={inputRef}
          spellCheck={false}
          value={innerValue}
          onChange={(e) => setInnerValue(e.target.value)}
          placeholder={value}
          onKeyDown={onKeyDown}
          onFocus={(e) => {
            e.target.selectionStart = e.target.selectionEnd = innerValue.length
          }}
          className={twm(
            "px-space-xs py-space-md",
            "grow !outline-0",
            "underline underline-offset-4",
            "decoration-base-outline decoration-2",
            "h-full w-full",
            "resize-none",
            "caret-base-outline caret",
            "!outline-0"
          )}
        />
        <div className="h-box-md gap-space-sm px-space-md flex items-center">
          <TooltipTrigger delay={500} closeDelay={0}>
            <Button
              onPress={handleSubmit}
              className={iconButton({
                size: "sm",
                hoverColor: "neutral",
                class: "!text-base-outline",
              })}
              isDisabled={!hasChanges}
            >
              {hasChanges ? <CheckIcon strokeWidth={2.5} /> : null}
            </Button>
            <Tooltip placement="bottom" offset={8} className={tooltip()}>
              Save
            </Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={500} closeDelay={0}>
            <Button
              onPress={hasChanges ? handleReset : () => setIsEditMode(false)}
              className={iconButton({ size: "sm", hoverColor: "neutral" })}
            >
              {hasChanges ? <Undo2Icon strokeWidth={2.5} /> : <XIcon strokeWidth={2.5} />}
            </Button>
            <Tooltip placement="bottom" offset={8} className={tooltip()}>
              {hasChanges ? "Undo" : "Cancel"}
            </Tooltip>
          </TooltipTrigger>
        </div>
      </Popover>
    </DialogTrigger>
  )
}
