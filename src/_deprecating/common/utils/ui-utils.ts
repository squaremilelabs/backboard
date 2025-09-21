import { extendTailwindMerge } from "tailwind-merge"
import { ClassValue, VariantProps, createTV } from "tailwind-variants"

/**
 * Tailwind Merge configuration to be applied to
 * global `tv` function & utility `cn` function below.
 */

const twMergeConfig: Parameters<typeof extendTailwindMerge>[0] = {
  // Add custom configurations here if needed
}

export const tv = createTV({ twMergeConfig })
export const cn = (...inputs: ClassValue[]) => extendTailwindMerge(twMergeConfig)(...inputs)

/** Re-export of TV types for usage in components */
export type { ClassValue, VariantProps }

/**
 * Utility type to create a deep Partial type.
 * Relevant for making classNames properties deeply optional.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Utility function to render children with RAC render props,
 * additional classNames, etc if passed as a function.
 */
export function renderChildren<T extends object[]>(
  children: React.ReactNode | ((...args: T) => React.ReactNode),
  ...args: T
): React.ReactNode {
  if (typeof children === "function") return children(...args)
  return children
}

/** Utility type for appending defaultChildren to RAC render props */
export type WithDefaultChildren<T extends object> = T & { defaultChildren?: React.ReactNode }
