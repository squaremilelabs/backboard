# GridList Documentation

## Usage

See: https://react-spectrum.adobe.com/react-aria/GridList.html

### Notes
- Enforces dynamic items (no static)

### Composition
- `<GridList />` (slots.base)
- `<GridListItem />` (slots.item)

### Example
```tsx
<GridList items={items}>
  {(item, classNames) => (
    <GridListItem
      id={item.id}
      textValue={item.name}
      className={classNames.item}
    >
      {children || ((renderProps) => children)}
    </GridListItem>
  )}
</GridList>
```
