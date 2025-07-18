import { extendTailwindMerge } from "tailwind-merge"
import { ClassValue, createTV } from "tailwind-variants"

/**
 * Tailwind Merge configuration to be applied to
 * global `twv` function & utility `twm` function below.
 */

const twMergeConfig: Parameters<typeof extendTailwindMerge>[0] = {
  // Add custom configurations here if needed
}

export const twv = createTV({ twMergeConfig })
export const twm = (...inputs: ClassValue[]) => extendTailwindMerge(twMergeConfig)(...inputs)
