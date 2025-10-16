"use client"

import { ReactNode, useContext, useEffect, useState } from "react"
import {
  Modal,
  ModalOverlay,
  ModalOverlayProps,
  OverlayTriggerState,
  OverlayTriggerStateContext,
  Popover,
  PopoverProps,
} from "react-aria-components"
import { createPortal } from "react-dom"
import { ClassValue, VariantProps } from "tailwind-variants"
import { useDebounceCallback } from "usehooks-ts"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { SlottedClassNames, twm, twv } from "@/lib/tailwind"

const TRANSITION_DURATION = 300
const TRANSITION_DURATION_CLASSNAME = "duration-300"

type OverlayRACType = "modal" | "popover"

type OverlayVisualType<R extends OverlayRACType> = R extends "popover"
  ? "modal" | "popover" | "sheet"
  : "modal" | "sheet"

type OverlayResponsiveVisualType<R extends OverlayRACType> = {
  desktop: OverlayVisualType<R>
  mobile: OverlayVisualType<R>
}

type OverlayRenderProps<R extends OverlayRACType> = {
  overlayState: OverlayTriggerState | null
  resolvedVisualType: OverlayVisualType<R>
}

export type OverlayProps<R extends OverlayRACType> = {
  children?: ReactNode | ((props: OverlayRenderProps<R>) => ReactNode)
  racType: R
  visualType?: OverlayVisualType<R> | OverlayResponsiveVisualType<R>
  variants?: Omit<VariantProps<typeof overlayClasses>, "visualType" | "isMounting">
  classNames?: Partial<SlottedClassNames<typeof overlayClasses, OverlayRenderProps<R>>>
} & (R extends "modal"
  ? Omit<ModalOverlayProps, "children" | "className">
  : Omit<PopoverProps, "children" | "className">)

export function Overlay<R extends OverlayRACType>({
  children,
  racType,
  visualType,
  classNames,
  variants,
  ...props
}: OverlayProps<R>) {
  const overlayState = useContext(OverlayTriggerStateContext)

  // Delayed mounted state for transitioning style & behavior purposes
  const isOpen = props.isOpen ?? !!overlayState?.isOpen
  const [isMounted, setIsMounted] = useState(false)
  const delayedMount = useDebounceCallback(() => setIsMounted(true), TRANSITION_DURATION)
  useEffect(() => {
    if (isOpen) delayedMount()
    else setIsMounted(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])
  const isMounting = isOpen && !isMounted

  // Resolve the visual type
  const isMobile = useIsMobile()
  let resolvedVisualType = racType as OverlayVisualType<R>
  if (typeof visualType === "string") {
    resolvedVisualType = visualType
  }
  if (typeof visualType === "object") {
    resolvedVisualType = isMobile ? visualType.mobile : visualType.desktop
  }

  const renderProps: OverlayRenderProps<R> = { overlayState, resolvedVisualType }

  // Prepare slotted styles
  const { underlay, overlay } = overlayClasses({
    ...variants,
    isMounting,
    visualType: resolvedVisualType,
  })
  const underlayStyles = underlay({
    className:
      typeof classNames?.underlay === "function"
        ? classNames.underlay(renderProps)
        : classNames?.underlay,
  })
  const overlayStyles = overlay({
    className:
      typeof classNames?.overlay === "function"
        ? classNames.overlay(renderProps)
        : classNames?.overlay,
  })

  // Render Modal
  if (racType === "modal") {
    return (
      <ModalOverlay className={underlayStyles} {...(props as ModalOverlayProps)}>
        <Modal className={overlayStyles}>
          {typeof children === "function" ? children(renderProps) : children}
        </Modal>
      </ModalOverlay>
    )
  }

  // Render Popover
  if (racType === "popover") {
    return (
      <Popover
        className={overlayStyles}
        offset={4}
        containerPadding={0}
        {...(props as PopoverProps)}
      >
        {/* Though this is nested inside of Popover, it renders as a portal behind the overlay */}
        <PopoverUnderlay className={underlayStyles} isOpen={isOpen} />
        {typeof children === "function" ? children(renderProps) : children}
      </Popover>
    )
  }
}

function PopoverUnderlay({ className, isOpen }: { className: ClassValue; isOpen: boolean }) {
  if (!isOpen) return null
  if (typeof document === "undefined") return null
  return createPortal(<div id="popover-underlay" className={twm(className)} />, document.body)
}

export const overlayClasses = twv({
  slots: {
    underlay: [
      "fixed inset-0 h-dvh w-dvw",
      "opacity-100",
      "data-entering:opacity-0 data-exiting:opacity-0 starting:opacity-0",
      "transition-opacity",
      TRANSITION_DURATION_CLASSNAME,
    ],
    overlay: ["transition-all", TRANSITION_DURATION_CLASSNAME],
  },
  variants: {
    visualType: {
      modal: {
        underlay: [
          "p-space-xl flex flex-col items-center-safe",
          "bg-neutral-muted-bg/50 backdrop-blur-xs",
        ],
        overlay: ["max-h-full"],
      },
      popover: {
        underlay: [],
        overlay: [
          // Classes for animation
          // "origin-(--trigger-anchor-point)",
          // "data-entering:opacity-0 data-exiting:opacity-0",
          // "data-[placement=bottom]:data-entering:-translate-y-4 data-[placement=bottom]:data-exiting:-translate-y-4",
          // "data-[placement=top]:data-entering:translate-y-4 data-[placement=top]:data-exiting:translate-y-4",
          // "data-[placement=right]:data-entering:-translate-x-4 data-[placement=right]:data-exiting:-translate-x-4",
          // "data-[placement=left]:data-entering:translate-x-4 data-[placement=left]:data-exiting:translate-x-4",
          // Default size: md
        ],
      },
      sheet: {
        underlay: [],
        overlay: [
          "!fixed !top-auto !bottom-0 !left-0",
          "w-dvw",
          "data-entering:h-0 data-exiting:h-0",
          "data-entering:overflow-hidden data-exiting:overflow-hidden",
        ],
      },
    },
    underlayAppearance: {
      transparent: {
        underlay: ["!bg-transparent !backdrop-blur-none"],
      },
      blur: {
        underlay: ["bg-neutral-muted-bg/50 backdrop-blur-xs"],
      },
      dim: {
        underlay: ["bg-neutral-bg/50"],
      },
    },
    // Prevents pointer eventsduring the mounting transition
    isMounting: {
      true: {
        overlay: ["pointer-events-none [&_*]:pointer-events-none"],
      },
    },
  },
})
