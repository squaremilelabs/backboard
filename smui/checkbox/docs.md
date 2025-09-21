# Checkbox

https://react-spectrum.adobe.com/react-aria/Checkbox.html
https://react-spectrum.adobe.com/react-aria/CheckboxGroup.html

__Notes__
- Checkbox children are wrapped in a `span` element to apply the label styles.
- CheckboxGroup can implement the SMUI `field` components & variants.

__Composition__
- `<Checkbox />` (slots.checkboxBase)
- `<Checkbox />` ... `<Icon />` (slots.checkboxIcon - INTERNAL)
- `<Checkbox />` ... `<span />` (slots.checkboxLabel - INTERNAL)
- `<CheckboxGroup />` (slots.group)

__Checkbox__
```tsx
  // Icon only
  <Checkbox />

  // With label (as children)
  <Checkbox>
    {children || (renderProps) => children}
  </Checkbox>
```

__CheckboxGroup__
```tsx
  <CheckboxGroup>
    {(renderProps, classNames) => (
      <>
        <Checkbox classNames={classNames.checkbox} />
        <Checkbox classNames={classNames.checkbox} />
        <Checkbox classNames={classNames.checkbox} />
      </>
    )}
  </CheckboxGroup>
```

__CheckboxGroup with Field Components__
```tsx
  <CheckboxGroup 
    variants={{} as CheckboxVariantProps}
    fieldVariants={{} as FieldVariantProps}
    >
    {(renderProps, classNames) => (
      <>
        <FieldLabel className={classNames.field.label}>
        <Checkbox classNames={classNames.checkbox} />
        <Checkbox classNames={classNames.checkbox} />
        <Checkbox classNames={classNames.checkbox} />
        <FieldDescription className={classNames.field.description}>
        <FieldError className={classNames.field.error}>
      </>
    )}
  </CheckboxGroup>
```