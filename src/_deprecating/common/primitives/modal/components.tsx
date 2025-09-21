"use client"

import React from "react"
import {
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  ModalOverlayProps as AriaModalOverlayProps,
  ModalRenderProps as AriaModalRenderProps,
  Dialog as AriaDialog,
  DialogProps as AriaDialogProps,
  DialogRenderProps as AriaDialogRenderProps,
  DialogTrigger as AriaDialogTrigger,
  DialogTriggerProps as AriaDialogTriggerProps,
} from "react-aria-components"
import { renderChildren, WithDefaultChildren } from "../../utils/ui-utils"
import { ModalClassNames, ModalVariantProps, modalVariants } from "./variants"

export type ModalRenderProps = WithDefaultChildren<AriaModalRenderProps> & AriaDialogRenderProps
export type ModalProps = Omit<AriaModalOverlayProps, "children" | "className"> & {
  variants?: ModalVariantProps
  classNames?: Partial<ModalClassNames>
  children: React.ReactNode | ((renderProps: ModalRenderProps) => React.ReactNode)
  dialogProps?: Omit<AriaDialogProps, "children" | "className">
}

export type ModalTriggerProps = AriaDialogTriggerProps

// # Components -----------------------------------------------------------------------------------

export function Modal({ children, classNames, variants, dialogProps, ...props }: ModalProps) {
  const {
    overlay: overlayStyles,
    modal: modalStyles,
    content: contentStyles,
  } = modalVariants(variants)

  return (
    <AriaModalOverlay {...props} className={overlayStyles({ className: classNames?.overlay })}>
      <AriaModal className={modalStyles({ className: classNames?.modal })}>
        {(modalRenderProps) => (
          <AriaDialog
            {...dialogProps}
            className={contentStyles({ className: classNames?.content })}
          >
            {(dialogRenderProps) =>
              renderChildren(children, {
                ...modalRenderProps,
                ...dialogRenderProps,
              })
            }
          </AriaDialog>
        )}
      </AriaModal>
    </AriaModalOverlay>
  )
}

export const ModalTrigger = AriaDialogTrigger
