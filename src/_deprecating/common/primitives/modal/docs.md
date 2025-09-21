# Modal

https://react-spectrum.adobe.com/react-aria/Modal.html

__Notes__
- Reduces the RAC composition (`ModalOverlay`, `Modal`, `Dialog`) to a single component.
- Combines RAC renderProps from both `Modal` and `Dialog`

__Composition__
- `<Modal /> ... <AriaModalOverlay />` (slots.overlay – INTERNAL)
- `<Modal /> ... <AriaModal />` (slots.modal – INTERNAL)
- `<Modal /> ... <AriaDialog />` (slots.content – INTERNAL)

__Basic (with ModalTrigger)__
```tsx
  <ModalTrigger>
    <Button>Open</Button>
    <Modal>
      {children || (renderProps) => children}
    </Modal>
  </ModalTrigger>
```

__Without ModalTrigger__
```tsx
  const [isOpen, setIsOpen] = React.useState(false)
  <Modal open={isOpen} onOpenChange={setIsOpen}>
    {children || (renderProps) => children}
  </Modal>
```