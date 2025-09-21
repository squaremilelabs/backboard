"use client"

import React from "react"
import {
  MenuTrigger as AriaMenuTrigger,
  MenuTriggerProps as AriaMenuTriggerProps,
  Menu as AriaMenu,
  MenuProps as AriaMenuProps,
  MenuItem as AriaMenuItem,
  MenuItemProps as AriaMenuItemProps,
  MenuItemRenderProps as AriaMenuItemRenderProps,
  MenuSection as AriaMenuSection,
  MenuSectionProps as AriaMenuSectionProps,
  Header as AriaHeader,
  Collection as AriaCollection,
  Popover as AriaPopover,
  Key,
} from "react-aria-components"
import { cn, DeepPartial, WithDefaultChildren, ClassValue } from "../utils"
import { popoverVariants } from "../popover/variants"
import { MenuVariantProps, MenuClassNames, menuVariants } from "./variants"

export type MenuTriggerProps = AriaMenuTriggerProps

export type MenuProps<T extends object> = Omit<
  AriaMenuProps<T>,
  "children" | "className" | "items"
> & {
  variants?: MenuVariantProps
  classNames?: DeepPartial<MenuClassNames>
  items: Array<T> // enforced
  children: (item: T, classNames: Omit<MenuClassNames, "base">) => React.ReactNode
}

export type MenuItemRenderProps = WithDefaultChildren<AriaMenuItemRenderProps>
export type MenuItemProps = Omit<AriaMenuItemProps, "id" | "textValue" | "className"> & {
  id: Key // enforced
  textValue: string // enforced
  className: ClassValue
}

export type MenuSectionProps<T extends object> = Omit<
  AriaMenuSectionProps<T>,
  "id" | "items" | "children" | "className"
> & {
  id: Key // enforced
  items: Array<T> // enforced
  classNames: MenuClassNames["section"]
  header?: React.ReactNode
  children: (item: T) => React.ReactNode
}

export function MenuTrigger({ children, ...props }: MenuTriggerProps) {
  return <AriaMenuTrigger {...props}>{children}</AriaMenuTrigger>
}

export function Menu<T extends object>({
  variants,
  classNames,
  items,
  children,
  ...props
}: MenuProps<T>) {
  const {
    base: baseStyles,
    item: itemStyles,
    section: sectionStyles,
    sectionHeader: sectionHeaderStyles,
  } = menuVariants(variants)

  const baseClassName = baseStyles({ className: classNames?.base })

  const { popover: popoverStyles } = popoverVariants(variants?.popover)
  const popoverClassName = popoverStyles({ className: classNames?.popover })

  const childrenClassNames = {
    popover: popoverClassName,
    item: itemStyles({ className: classNames?.item }),
    section: {
      base: sectionStyles({ className: classNames?.section?.base }),
      header: sectionHeaderStyles({ className: classNames?.section?.header }),
    },
  }

  return (
    <AriaPopover className={popoverClassName}>
      <AriaMenu {...props} items={items} className={baseClassName}>
        {(item) => children(item, childrenClassNames)}
      </AriaMenu>
    </AriaPopover>
  )
}

export function MenuItem({ className, ...props }: MenuItemProps) {
  return <AriaMenuItem {...props} className={cn(className)} />
}

export function MenuSection<T extends object>({
  id,
  classNames,
  items,
  header,
  children,
  ...props
}: MenuSectionProps<T>) {
  return (
    <AriaMenuSection {...props} id={id} className={cn(classNames?.base)}>
      {header && <AriaHeader className={cn(classNames?.header)}>{header}</AriaHeader>}
      <AriaCollection items={items}>{children}</AriaCollection>
    </AriaMenuSection>
  )
}
