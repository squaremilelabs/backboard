"use client"

import {
  Disclosure as AriaDisclosure,
  DisclosureProps as AriaDisclosureProps,
  DisclosureRenderProps as AriaDisclosureRenderProps,
  DisclosurePanel as AriaDisclosurePanel,
  DisclosurePanelProps as AriaDisclosurePanelProps,
  Heading as AriaHeading,
  HeadingProps as AriaHeadingProps,
} from "react-aria-components"
import { cn, ClassValue, WithDefaultChildren } from "../utils"
import { disclosureVariants, DisclosureVariantProps, DisclosureClassNames } from "./variants"

// # Props ----------------------------------------------------------------------------------------

export type DisclosureRenderProps = WithDefaultChildren<AriaDisclosureRenderProps>
export type DisclosureProps = Omit<AriaDisclosureProps, "className" | "children"> & {
  variants?: DisclosureVariantProps
  classNames?: Partial<DisclosureClassNames>
  children: (
    renderProps: DisclosureRenderProps,
    classNames: Omit<DisclosureClassNames, "base">
  ) => React.ReactNode
}

export type DisclosureHeadingProps = Omit<AriaHeadingProps, "className"> & {
  className: ClassValue
}

export type DisclosurePanelProps = Omit<AriaDisclosurePanelProps, "className"> & {
  className: ClassValue
}

// # Components -----------------------------------------------------------------------------------

export function Disclosure({ variants, classNames, children, ...props }: DisclosureProps) {
  const {
    base: baseStyles,
    heading: headingStyles,
    panel: panelStyles,
  } = disclosureVariants(variants)

  const baseClassName = baseStyles({ className: classNames?.base })

  const childrenClassNames = {
    heading: headingStyles({ className: classNames?.heading }),
    panel: panelStyles({ className: classNames?.panel }),
  }

  return (
    <AriaDisclosure {...props} className={baseClassName}>
      {(renderProps) => children(renderProps, childrenClassNames)}
    </AriaDisclosure>
  )
}

export function DisclsoureHeading({ className, ...props }: DisclosureHeadingProps) {
  return <AriaHeading {...props} className={cn(className)} />
}

export function DisclosurePanel({ className, ...props }: DisclosurePanelProps) {
  return <AriaDisclosurePanel {...props} className={cn(className)} />
}
