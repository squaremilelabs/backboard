# Button

https://react-spectrum.adobe.com/react-aria/Button.html
https://react-spectrum.adobe.com/react-aria/Group.html

__Notes__
- `Button` has no special modifications from the RAC component.
- There is no `ButtonGroup` RAC. Uses the `Group` component.

__Composition__
- `<Button />` (slots.button)
- `<ButtonGroup />` (slots.group)

__Button__
```tsx
  <Button>
    {children || (renderProps) => children}
  </Button>
```

__ButtonGroup__
```tsx
  <ButtonGroup>
    {(renderProps, classNames) => (
      <>
        <Button className={classNames.button} />
        <Button className={classNames.button} />
        <Button className={classNames.button} />
      </>
    )}
  </ButtonGroup>
```