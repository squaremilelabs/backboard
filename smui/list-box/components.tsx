import React from "react"
import {
  ListBox as AriaListBox,
  ListBoxProps as AriaListBoxProps,
  ListBoxItem as AriaListBoxItem,
  ListBoxSection as AriaListBoxSection,
  ListBoxItemProps as AriaListBoxItemProps,
  ListBoxItemRenderProps as AriaListBoxItemRenderProps,
  ListBoxSectionProps as AriaListBoxSectionProps,
  Header as AriaHeader,
  Collection as AriaCollection,
  Key,
} from "react-aria-components"
import { cn, DeepPartial, WithDefaultChildren, ClassValue } from "../utils"
import { listBoxVariants, ListBoxVariantProps, ListBoxClassNames } from "./variants"

export type ListBoxProps<T extends object> = Omit<
  AriaListBoxProps<T>,
  "children" | "className" | "items"
> & {
  variants?: ListBoxVariantProps
  classNames?: DeepPartial<ListBoxClassNames>
  items: Array<T> // enforced
  children: (item: T, classNames: Omit<ListBoxClassNames, "base">) => React.ReactNode
}

export type ListBoxItemRenderProps = WithDefaultChildren<AriaListBoxItemRenderProps>
export type ListBoxItemProps = Omit<AriaListBoxItemProps, "id" | "textValue" | "className"> & {
  id: Key // enforced
  textValue: string // enforced
  className: ClassValue
}

export type ListBoxSectionProps<T extends object> = Omit<
  AriaListBoxSectionProps<T>,
  "id" | "items" | "children" | "className"
> & {
  id: Key // enforced
  items: Array<T> // enforced
  classNames: ListBoxClassNames["section"]
  header?: React.ReactNode
  children: (item: T) => React.ReactNode
}

export function ListBox<T extends object>({
  variants,
  classNames,
  items,
  children,
  ...props
}: ListBoxProps<T>) {
  const {
    base: baseStyles,
    item: itemStyles,
    section: sectionStyles,
    sectionHeader: sectionHeaderStyles,
  } = listBoxVariants(variants)

  const baseClassName = baseStyles({ className: classNames?.base })

  const childrenClassNames = {
    item: itemStyles({ className: classNames?.item }),
    section: {
      base: sectionStyles({ className: classNames?.section?.base }),
      header: sectionHeaderStyles({ className: classNames?.section?.header }),
    },
  }

  return (
    <AriaListBox {...props} items={items} className={baseClassName}>
      {(item) => children(item, childrenClassNames)}
    </AriaListBox>
  )
}

export function ListBoxItem({ className, ...props }: ListBoxItemProps) {
  return <AriaListBoxItem {...props} className={cn(className)} />
}

export function ListBoxSection<T extends object>({
  id,
  classNames,
  items,
  header,
  children,
  ...props
}: ListBoxSectionProps<T>) {
  return (
    <AriaListBoxSection {...props} id={id} className={cn(classNames?.base)}>
      {header && <AriaHeader className={cn(classNames?.header)}>{header}</AriaHeader>}
      <AriaCollection items={items}>{children}</AriaCollection>
    </AriaListBoxSection>
  )
}
