# `@smui`
It's pronounced "smooey"

## Motivations

First, IMO, [React Aria](https://react-spectrum.adobe.com/react-aria/components.html) has the best Component API and is the superior choice for accessibility. Plus, it doesn't force styles on you.

I started dabbling with [HeroUI](https://www.heroui.com/) (fka NextUI) because it's built on **React Aria**, but adds a useful layer of styling structure with [Tailwind Variants](https://www.tailwind-variants.org/docs/introduction) which **React Aria** intentionally leaves behind. But it is still just another component library with opinionated styling and limited customizability.

Enter: [shadcn](https://ui.shadcn.com/). They are really onto something by developing a **code distribution platform**, not a **component library**. You don't install a package, you copy primitive code into your app and modify.

But a few remaining issues with **shadcn**:

1. It's built on top of [RadixUI](https://www.radix-ui.com/primitives), and again, I'm set on **React Aria**. (I did find [JollyUI](https://www.jollyui.dev/), which is an RAC alternative, but the next point is actually the more important issue).

2. It still comes with predetermined themes & styles. Each component has Tailwind classes written inline and relies on a set of decided theme tokens to be defined globally. To clarify, while the theme _values_ are indeed customizable, the theme _tokens_ (`primary`, `primary-foreground`, etc.) are not. This forces developers into that tokenized design system.

So I'm building a **shadcn**-like set of reusable components, but...

1. I'm using **React Aria** instead of **RadixUI**. I'm mainly exposing the full Component API, but in some scenarios, I've decided to narrow down or modify it's usage for a consistent DX.

2. I'm providing styling _structure_ with **Tailwind Variants**, but keeping `classNames` empty for a truly-unstyled starting point. Developers define their own theme tokens and fill in their own variants.

^ That's `@smui`.


__🚧 DOCS BELOW ARE WIP 🚧__
--

## Usage

### Initial Setup
1. Install core dependencies (there are only 3!). Note that some components have additional dependencies. Install as needed.

```bash
pnpm add react-aria-components tailwind-variants tailwind-merge
```

2. Copy the smui directory contents into your app (including the `utils` file). Or, pick and choose specific components – just like shadcn.

3. (Optional) Customize the [`twMergeConfig`](https://github.com/dcastil/tailwind-merge/blob/v3.3.1/docs/configuration.md) in `utils` if relevant.

### Component-Level Styling

Each component is _completely unstyled_ out of the box.

Each component file has a `variants.ts` file intended to be customized with tailwind classes using [__Tailwind Variants__](https://www.tailwind-variants.org/).

Below is a starting example from `list-box`. Notice how each `slot` is labeled with a comment indicating which component it will be applied to. The actual slot keys should not be modified, only the values.

```tsx
// list-box/variants.ts

export type ListBoxVariantProps = VariantProps<typeof listBoxVariants>
export const listBoxVariants = tv({
  slots: {
    // <ListBox />
    base: [],
    // <ListBoxItem />
    item: [],
    // <ListBoxSection />
    section: [],
    // <ListBoxSection /> ... <Header />
    sectionHeader: [],
  },
  variants: {
    variant: {
      default: {},
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

```

Below is an example of how you might populate the variants. This is just a minimum example. Refer to the __Tailwind Variants__ docs for complete usage.

```tsx
export const listBoxVariants = tv({
  /** 
   * ⚙️ Apply base level styles that would apply to all variants 
   * The actual slot keys should not be modified.
   * */
  slots: {
    // <ListBox />
    base: ["flex flex-col"],
    // <ListBoxItem />
    item: ["flex items-center"],
    // <ListBoxSection />
    section: ["flex flex-col"],
    // <ListBoxSection /> ... <Header />
    sectionHeader: ["font-bold"],
  },
  /** 
   * ⚙️ Define your variants 
   * A default variant is added as a placeholder to all components, but it does not need to be used. 
   * */
  variants: {
    variant: {
      default: {
        base: ["divide-neutral-300 border-neutral-300 border divide-y"],
        item: ["data-selected:bg-neutral-50"],
        sectionHeader: ["border-neutral-300"]
      },
      flat: {
        base: ["border-0 divide-0"],
        item: ["data-selected:border"],
        sectionHeader: ["border-b"]
      },
    },
    size: {
      sm: { ... },
      md: { ... },
      lg: { ... }
    },
  },
  /** ⚙️ Add compound variants if relevant  */
  compoundVariants: [],
  /** ⚙️ Customize default variants  */
  defaultVariants: {
    variant: "default",
    size: "md"
  },
})
```

### Application Usage

Each component takes a `variants` prop for your component-defined `tv` styles.

Theoretically, you would have captured all relevant styling at the component-level, but each slotted component also accepts an optional `classNames` prop with the anatomical structure in case you need to make app-level styling edits. (Unslotted components accept a plain `className` as expected).

See below example for how styles then get passed down with a `classNames` argument provided to a children function.

Beyond the above, each component exposes the corresponding __React Aria__ component props. Refer to the RAC docs for complete usage. As mentioned in __Motivations__ above, some components have slightly altered APIs for consistent DX. Refer to `docs.md` included with each component for full usage.

```tsx
import { ListBox, ListBoxSection, ListBoxItem } from "{PATH_TO_SMUI_COMPONENTS}/list-box/component"

function App(){
  return (
    <ListBox
      variants={{ variant: "flat", size: "sm" }}
      classNames={{ 
        base: "bg-white",
        item: "data-focus-visible:border",
        section: { 
          base: "bg-blue-100", 
          header: "text-blue-500" 
        }
      }}
      items={sections}
      selectionMode="multiple"
    >
      {(section, classNames) => (
        <ListBoxSection
          id={section.id}
          items={section.items}
          classNames={classNames.section}
          header="HEADER"
        >
          {(item) => (
            <ListBoxItem id={item.id} textValue={item.label} className={classNames.item}> 
              {({ isSelected }) => `${item.value}${isSelected ? " (Selected)" : ""}` } 
            </ListBoxItem>
          )}
        </ListBoxSection>
      )}
    </ListBox>
  )
}

```