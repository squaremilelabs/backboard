"use client"

import {
  Label as AriaLabel,
  LabelProps as AriaLabelProps,
  FieldError as AriaFieldError,
  FieldErrorProps as AriaFieldErrorProps,
  FieldErrorRenderProps as AriaFieldErrorRenderProps,
  Group as AriaGroup,
  GroupProps as AriaGroupProps,
  Text as AriaText,
  TextProps as AriaTextProps,
} from "react-aria-components"
import { cn, ClassValue } from "../utils"

export type FieldLabelProps = Omit<AriaLabelProps, "className"> & {
  className: ClassValue
}

export type FieldInputGroupProps = Omit<AriaGroupProps, "className"> & {
  className: ClassValue
}

export type FieldDescriptionProps = Omit<AriaTextProps, "className"> & {
  className: ClassValue
}

export type FieldErrorRenderProps = AriaFieldErrorRenderProps
export type FieldErrorProps = Omit<AriaFieldErrorProps, "className"> & {
  className: ClassValue
}

export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return <AriaLabel {...props} className={cn(className)} />
}

export function FieldInputGroup({ className, ...props }: FieldInputGroupProps) {
  return <AriaGroup {...props} className={cn(className)} />
}

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return <AriaText {...props} slot="description" className={cn(className)} />
}

export function FieldError({ className, ...props }: FieldErrorProps) {
  return <AriaFieldError {...props} className={cn(className)} />
}
