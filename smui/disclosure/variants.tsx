"use client"

import { tv, VariantProps, ClassValue } from "../utils"

export type DisclosureVariantProps = VariantProps<typeof disclosureVariants>
export const disclosureVariants = tv({
  slots: {
    // <Disclosure>
    base: [],
    // <DisclosureHeading>
    heading: [],
    // <DisclosurePanel>
    panel: [],
  },
})

export type DisclosureClassNames = {
  // slots.base
  base: ClassValue
  // slots.heading
  heading: ClassValue
  // slots.panel
  panel: ClassValue
}
