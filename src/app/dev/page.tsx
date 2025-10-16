"use client"

import {
  Disclosure,
  DisclosurePanel,
  GridList,
  GridListHeader,
  GridListItem,
  GridListSection,
  Heading,
} from "react-aria-components"

export default function Dev() {
  return (
    <GridList aria-label="Grid List">
      <GridListItem id={1}>Item 1</GridListItem>
      <GridListItem id={2}>Item 2</GridListItem>
      <GridListSection>
        <GridListHeader>Section 1</GridListHeader>
        <GridListItem id={3}>Item 3</GridListItem>
        <GridListItem id={4}>Item 4</GridListItem>
      </GridListSection>
    </GridList>
  )
}
