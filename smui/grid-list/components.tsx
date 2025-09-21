"use client"

import {
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  GridListProps as AriaGridListProps,
  GridListItemProps as AriaGridListItemProps,
  GridListItemRenderProps as AriaGridListItemRenderProps,
  Key,
} from "react-aria-components"
import { cn } from "../utils"
import type { DeepPartial, WithDefaultChildren, ClassValue } from "../utils"
import type { GridListVariantProps, GridListClassNames } from "./variants"

export type GridListProps<T extends object> = Omit<
  AriaGridListProps<T>,
  "children" | "className" | "items"
> & {
  variants?: GridListVariantProps
  classNames?: DeepPartial<GridListClassNames>
  items: Array<T>
  children: (item: T, classNames: Omit<GridListClassNames, "base">) => React.ReactNode
}

export type GridListItemRenderProps = WithDefaultChildren<AriaGridListItemRenderProps>
export type GridListItemProps = Omit<AriaGridListItemProps, "id" | "className" | "textValue"> & {
  id: Key
  textValue: string
  className: ClassValue
}
import { gridListVariants } from "./variants"

export function GridList<T extends object>({
  variants,
  classNames,
  items,
  children,
  ...props
}: GridListProps<T>) {
  const { base: baseStyles, item: itemStyles } = gridListVariants(variants)
  const baseClassName = baseStyles({ className: classNames?.base })
  const childrenClassNames = {
    item: itemStyles({ className: classNames?.item }),
  }
  return (
    <AriaGridList {...props} items={items} className={baseClassName}>
      {(item) => children(item as T, childrenClassNames)}
    </AriaGridList>
  )
}

export function GridListItem({ id, className, textValue, ...props }: GridListItemProps) {
  return <AriaGridListItem id={id} textValue={textValue} className={cn(className)} {...props} />
}
