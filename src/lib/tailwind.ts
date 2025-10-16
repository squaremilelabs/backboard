import { extendTailwindMerge } from "tailwind-merge"
import { ClassValue, createTV } from "tailwind-variants"

/**
 * Tailwind Merge configuration to be applied to
 * global `twv` function & utility `twm` functions below.
 */

const twMergeConfig: Parameters<typeof extendTailwindMerge>[0] = {
  extend: {
    theme: {
      spacing: [
        "space-xs",
        "space-sm",
        "space-md",
        "space-lg",
        "space-xl",
        "content-xs",
        "content-sm",
        "content-md",
        "content-lg",
        "content-xl",
        "box-xs",
        "box-sm",
        "box-md",
        "box-lg",
        "box-xl",
      ],
    },
  },
}

export const twv = createTV({ twMergeConfig })
export const twm = (...inputs: ClassValue[]) => extendTailwindMerge(twMergeConfig)(...inputs)

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Can't create a generic tv return type
export type SlottedClassNames<T extends (...args: any[]) => any, P extends object | null = null> = {
  [K in keyof ReturnType<T>]: P extends null ? ClassValue : ClassValue | ((props: P) => ClassValue)
}
