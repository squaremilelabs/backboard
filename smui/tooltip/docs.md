# Tooltip

https://react-spectrum.adobe.com/react-aria/Tooltip.html

__Notes__
- Does not implement an `OverlayArrow`
- Otherwise, No special modifications from the RAC component.

__Usage__
```tsx
  <TooltipTrigger>
    <Button>Hover</Button>
    <Tooltip>
      {children || (renderProps) => children}
    </Tooltip>
  </TooltipTrigger>
```