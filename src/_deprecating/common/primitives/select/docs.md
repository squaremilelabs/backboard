# Select

https://react-spectrum.adobe.com/react-aria/Select.html

__Notes__
- Can implement the SMUI `field` components & variants.
- Inherits `popoverVariants` for the `SelectPopover`.
- Same as RAC, excpects a `ListBox` descendent.
- Combines the `Button` and `SelectValue` into a single component, `SelectButton`.

__Composition__
- `<SelectPopover />` (not part of slots, but inherits popoverVariants for styling)
- `<Select />` (slots.base)
- `<SelectButton />` (slots.button)
- `<SelectButton />` ... `<AriaSelectValue />` (slots.buttonValue - INTERNAL)
- `<SelectButton />` ... `<SelectButtonIcon />` (slots.buttonIcon - INTERNAL)

__Basic__
```tsx
  <Select>
    {(renderProps, classNames) => (
      <>
        <SelectButton classNames={classNames.button}>
          {children || (renderProps) => (children)}
        </SelectButton>
        <SelectPopover className={classNames.popover}>
          <ListBox items={items} /> // Shortened for brevity. See ListBox component for full usage.
        </SelectPopover>
      </>
    )}
  </Select>
```

__With Field Components__
```tsx
  <Select>
    {(renderProps, classNames) => (
      <>
        <FieldLabel className={classNames.field.label}>
        <SelectButton classNames={cn(classNames.button, classNames.field.inputBox)}>
          {children || (renderProps) => (children)}
        </SelectButton>
        <FieldDescription className={classNames.field.description}>
        <FieldError className={classNames.field.error}>
        <SelectPopover className={classNames.popover}>
          <ListBox items={items} /> // Shortened for brevity. See ListBox component for full usage.
        </SelectPopover>
      </>
    )}
  </Select>
  
```