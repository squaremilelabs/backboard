# Menu

https://react-spectrum.adobe.com/react-aria/Menu.html

__Notes__
- Enforces dynamic items (no static)
- For sections, passes `Header` as a prop instead of an expected child
- Inherits `popoverVariants` for the `MenuPopover`
- Reduces the RAC composition (`MenuPopover` and `Menu`) to a single component (`Menu`)
- Does not support Submenus (yet)

__Composition__
- `<MenuTrigger />` (unstyled trigger component)
- `<Menu />` (slots.base)
- `<Menu />` ... `<AriaPopover />` (slots.popover - INTERNAL, inherits `popoverVariants`)
- `<MenuItem />` (slots.item)
- `<MenuSection />` (slots.section)
- `<MenuSection />` ... `<AriaHeader />` (slots.sectionHeader - INTERNAL)

__Basic__
```tsx
  <MenuTrigger>
    <Button>Menu</Button>
    <Menu 
      items={items} 
      variants={{} as MenuVariantProps} 
    >
      {(item, classNames) => (
        <MenuItem
          id={item.id}
          textValue={item.name}
          className={classNames.item}
        >
          {children || (renderProps) => children}
        </MenuItem>
      )}
    </Menu>
  </MenuTrigger>
```

__With Sections__
```tsx
  <MenuTrigger>
    <Button>Menu</Button>
    <Menu items={sections}>
      {(section, classNames) => (
        <MenuSection
          id={section.id}
          items={section.items}
          classNames={classNames.section}
          header={(<p>{section.name}</p>)}
        >
          {(item) => <MenuItem />} // Shortened for brevity. See basic usage example above.
        </MenuSection>
      )}
    </Menu>
  </MenuTrigger>
```