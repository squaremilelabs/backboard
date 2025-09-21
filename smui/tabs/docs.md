# Tabs

https://react-spectrum.adobe.com/react-aria/Tabs.html

__Notes__
- Does NOT implement the `TabPanel` component. (Just hook it up to state and render content)
- Reduces the RAC Composition (`Tabs`, `TabList`) to a single component, `Tabs`

__Composition__
- `<Tabs />` (slots.base)
- `<Tabs />` ... `<AriaTabList />` (slots.tabList - INTERNAL)
- `<Tab />` (slots.tab)

```tsx
  <Tabs items={items}>
    {(item, classNames) => (
      <Tab 
        id={item.id} 
        textValue={item.name}
        className={classNames.tab}
      >
        {children || (renderProps) => children}
      </Tab>
    )}
  </Tabs>
```