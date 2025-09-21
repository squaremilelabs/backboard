# ListBox

https://react-spectrum.adobe.com/react-aria/ListBox.html

__Notes__
- Enforces dynamic items (no static)
- For sections, passes `Header` as a prop instead of an expected child

__Composition__
- `<ListBox />` (slots.base)
- `<ListBoxItem />` (slots.item)
- `<ListBoxSection />` (slots.section - INTERNAL)
- `<ListBoxSection />` ... `<AriaHeader />` (slots.sectionHeader - INTERNAL)

__Basic (Items only)__
```tsx
  <ListBox items={items}>
    {(item, classNames) => (
      <ListBoxItem 
        id={item.id} 
        textValue={item.name} 
        className={classNames.item}
      >
        {children || (renderProps) => children}
      </ListBoxItem>
    )}
  </ListBox>
```

__With Sections__
```tsx
  <ListBox items={sections}>
    {(section, classNames) => (
      <ListBoxSection 
        id={section.id} 
        items={section.items} 
        classNames={classNames.section}
        header={(<p>{section.name}</p>)}
      >
        {(item) => <ListBoxItem />} // Shortened for brevity. See basic usage example above.
      </ListBoxSection>
    )}
  </ListBox>
```