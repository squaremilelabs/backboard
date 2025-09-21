# TextField

https://react-spectrum.adobe.com/react-aria/TextField.html

__Notes__
- Can implement the SMUI `field` components & variants.

Composition:
- `<TextField />` (slots.base)
- `<TextFieldInput />` (slots.input)
- `<TextFieldTextArea />` (slots.textarea)

__Basic (with Input)__
```tsx
  <TextField>
    {(renderProps, classNames) => (
      <TextFieldInput classNames={classNames.input} />
    )}
  </Select>
```

__With TextArea__
```tsx
  <TextField>
    {(renderProps, classNames) => (
      <TextFieldTextArea classNames={classNames.textarea} />
    )}
  </Select>
```

__With Field Components__
```tsx
  <TextField>
    {(renderProps, classNames) => (
      <>
        <FieldLabel className={classNames.field.label}>
        <TextFieldInput classNames={cn(classNames.input, classNames.field.inputBox)} />
        <FieldDescription className={classNames.field.description}>
        <FieldError className={classNames.field.error}>
      </>
    )}
  </TextField>
```

