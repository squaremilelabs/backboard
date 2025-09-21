# ToggleButton

https://react-spectrum.adobe.com/react-aria/ToggleButton.html
https://react-spectrum.adobe.com/react-aria/ToggleButtonGroup.html

__ToggleButton__
```tsx
  <ToggleButton>
    {children || (renderProps) => children}
  </ToggleButton>
```

__ToggleButtonGroup__
```tsx
  <ToggleButtonGroup>
    {(renderProps, classNames) => (
      <>
        <ToggleButton className={classNames.button} />
        <ToggleButton className={classNames.button} />
        <ToggleButton className={classNames.button} />
      </>
    )}
  </ToggleButtonGroup>
```