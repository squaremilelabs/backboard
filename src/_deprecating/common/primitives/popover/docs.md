# Popover

https://react-spectrum.adobe.com/react-aria/Popover.html

__Notes__
- Reduces the RAC composition (`Popover`, `Dialog`) to a single component.
- Combines RAC renderProps from both `Popover` and `Dialog`
- Does not implement an `OverlayArrow`

__Composition__
- `<PopoverTrigger />` (unstyled trigger component)
- `<Popover />` ... `<AriaPopover />` (slots.popover – INTERNAL)
- `<Popover />` ... `<AriaDialog />` (slots.content – INTERNAL)

__Basic (with PopoverTrigger)__
```tsx
  <PopoverTrigger>
    <Button>Open</Button>
    <Popover>
      {children || (renderProps) => children}
    </Popover>
  </PopoverTrigger>
```

__Without PopoverTrigger__
```tsx
  const triggerRef = React.useRef(null)
  const [isOpen, setIsOpen] = React.useState(false)
  
  <span ref={triggerRef} />
  <Popover triggerRef={triggerRef} open={isOpen} onOpenChange={setIsOpen}>
    {children || (renderProps) => children}
  </Popover>
```