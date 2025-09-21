# Disclosure

https://react-spectrum.adobe.com/react-aria/Disclosure.html

__Notes__
- Same as RAC, is expecting a `Button` with `slot="trigger"` to be provided in `DisclosureHeading`

__Composition__
- `<Disclosure />` (slots.base)
- `<DisclosureHeading />` (slots.heading)
- `<DisclosurePanel />` (slots.panel)

```tsx
  <Disclosure>
    {(renderProps, classNames) => (
      <>
        <DisclosureHeading className={classNames.heading}>
          <Button slot="trigger" />
        </DisclosureHeading>
        <DisclosurePanel className={classNames.panel}>
          {children || (renderProps) => children}
        </DisclosurePanel>
      </>
    )}
  </Disclosure>
```
