---
applyTo: "**"
---

# Backboard · LLM Co‑Developer Instructions

You are a co‑developer on Backboard. This app is built on:
- Instant (data and transactions). Read: https://www.instantdb.com/mcp-tutorial/other-rules.md
- React Aria Components (RAC) for accessible UI, wrapped by SMUI (local, shadcn‑like primitives).

Optimize for: small, safe changes; clear reasoning; accessible UX; Instant‑correct data ops; and consistency with the project’s structure.

----------------------------------------------------------------

## The Product

Backboard brings the “Inbox Zero” feeling to your actual work—scope by scope.

- Scope (scope of work): A container for related work—project, job, client, person, or objective. Anything that holds tasks.
- Task: A unit of work that moves through a simple lifecycle: current → snoozed → done.
- Recurring task: A task that regenerates on a schedule (weekday or monthday).
- Flow: Capture fast → focus on current → defer by snoozing → complete → reach zero per scope (and across scopes).

Principles
- Scope ≠ email. Educate “scope of work” as the core mental model.
- Momentum: Minimize friction to capture, reorder, snooze, and complete.
- Order matters: Reordering is first‑class and persists.
- Accessibility by default: RAC semantics, keyboard support, predictable states.

----------------------------------------------------------------

## Project Structure (high‑level)

- modules/: Feature‑first folders that co‑locate React components, hooks, and feature utilities.
  - Components: Accessible, composable UI; avoid business logic in UI.
  - Hooks: Encapsulate fetching, selection, DnD, actions, and derived state.
  - Utils: Feature‑scoped helpers (formatting, mapping, view adapters).
- common/: Truly shared, lower‑level primitives with zero business knowledge.
  - UI building blocks, className helpers, list/drag/order utilities, storage helpers.
- smui/: Local, shadcn‑like primitives built on RAC + Tailwind Variants.
  - Unstyled by default; styled via variants/classNames. Keep business logic out.
  - Treat as a library submodule; edits flow through the smui repo’s backboard branch.
- database/: Instant schema, typed models, and a thin data client.
  - Models expose parse helpers (parseXCreateInput/parseXUpdateInput) that validate/shape inputs and return { id, data, link? }.
  - All writes go through model parse helpers + db.transact; avoid ad hoc mutations.
- App shell: Thin pages/layouts assemble modules and provide auth, theming, and navigation.

Data and state flow (Instant + RAC + SMUI)
- Instant is the source of truth.
  - Reads: useDBQuery with graph‑shaped where/order/select; return render‑ready data.
  - Writes: Build inputs via model parse helpers, then db.transact using tx.merge/create; wire relationships via link objects returned by models.
  - Follow Instant rules: small, explicit transactions; don’t mutate system fields; don’t hand‑craft link shapes; prefer model‑validated inputs.
- Ordering as product data.
  - Persist list order (e.g., per‑account or per‑scope) via list_orders.
  - Use common list utilities to compute and present orders.
  - Apply optimistic updates after drops; avoid churn during drag.
- RAC patterns via SMUI.
  - Provide aria‑label/roles; correct selectionMode/selectionBehavior.
  - useDragAndDrop for DnD; implement getItems with stable, minimal serialized data; renderDragPreview for feedback.
  - Manage selection locally and prune when filtered items disappear.

A special note on SMUI
- SMUI is a WIP library that Square Mile Labs is working on (parent company of Backboard).
- This project is currently the first implementation of SMUI (we're using Backboard to also help define & develop SMUI)
- Please read /smui/docs.md for an understanding (but note that the docs & components in general are a WIP)

----------------------------------------------------------------

## Conventions and Invariants

Instant models and writes
- Never mutate Instant entities directly with ad hoc objects. Always:
  1) Build inputs with the model helpers.
  2) Call db.transact with tx.create/tx.merge/tx.delete.
  3) Wire relationships via link returned by model helpers (when applicable).
- Do not set or edit system fields (ids, created/updated timestamps) manually.
- Keep transactions minimal and focused on a single concern.
- Prefer explicit where/order clauses in queries; keep selected shape minimal.

Status and timestamps
- Task status transitions must go through model parse helpers (e.g., parseTaskUpdateInput). Let helpers manage status‑related fields (such as status_time).
- Snoozed tasks must carry their relevant schedule fields as defined by the model schema.

Ordering
- Treat ordering as data. Persist via list_orders on the relevant entity (commonly the Account for cross‑scope lists).
- Convention (current usage): list_orders["tasks/current"] for the cross‑scope “Current” list.
- Present lists via sortItemsByIdOrder with a deterministic fallback for missing ids (e.g., status_time).

SMUI usage
- Components accept variants and classNames; avoid hardcoding one‑off Tailwind in app components where variants belong.
- Do not change SMUI slot keys; only provide class values in variants.
- Keep SMUI business‑logic free.

Modules vs common
- Module code can depend on domain models and business rules.
- common must remain domain‑agnostic. If a utility references business entities, it belongs in a module.

Accessibility
- Favor RAC patterns: keyboard navigation, selection, focus rings, aria labels.
- Don’t remove accessible affordances for aesthetics.

----------------------------------------------------------------

## Prompt Guidelines (how to collaborate)

When proposing code:
- Show only minimal, surgical diffs. Use a single fenced code block per file edit.
- Use four backticks with a language tag, and add a filepath comment on the first line.
- Use // ...existing code... to indicate context around edits.
- Verify imports and path aliases ("@/…" for app, "~/" for SMUI).

Format for edits
- Explain the intent briefly (what/why).
- List the files you will change.
- Provide the code edits.

Example format
````markdown
Intent: Persist task reorder in the account’s list_orders after DnD.

Changes:
- src/modules/task/current-tasks-list/index.tsx: write to list_orders["tasks/current"].

```tsx
// filepath: /Users/elzr/sml/backboard/src/modules/task/current-tasks-list/index.tsx
// ...existing code...
const { data } = parseAccountUpdateInput({ list_orders: { "tasks/current": newOrder } })
db.transact(db.tx.accounts[instantAccount.id].merge(data))
// ...existing code...
```
````

Do
- Ask clarifying questions when requirements, data shapes, or UX are ambiguous.
- Prefer existing utilities:
  - list/drag: processItemKeys, reorderIds, sortItemsByIdOrder
  - styling: cn, typography, Tailwind tokens via variants
  - data: model parse helpers + db.transact
- Keep Instant transactions minimal and model‑validated.
- Preserve accessibility (labels, roles, selection behavior).
- Keep module boundaries: business logic in modules; primitives in common/smui.
- Add or update unit tests for model helpers and ordering utilities when changing them.

Don’t
- Don’t introduce new dependencies without explicit approval.
- Don’t mutate Instant data without model parse helpers.
- Don’t hand‑craft link objects or ids.
- Don’t push business logic into SMUI or common.
- Don’t remove accessible keyboard/focus behavior.

Helpful search queries (use VS Code search)
- list_orders usage: tasks/current, scopes/list
- parse helpers: parseTaskCreateInput, parseTaskUpdateInput, parseScopeCreateInput
- DnD: useDragAndDrop, processItemKeys, reorderIds
- Grid/List primitives: smui grid-list, list-box, menu

----------------------------------------------------------------

## Coding Style

TypeScript
- Prefer explicit types; avoid any unless strictly necessary.
- Derive types from models (e.g., Task, Scope) rather than re‑declaring shapes.
- Narrow union types and guard early.

React
- Co‑locate hooks with their module; name hooks as useFeatureThing.
- Keep components focused; lift feature logic into hooks/actions.
- Manage selection state locally; prune when visible items change.

Styling
- Tailwind tokens define theme. Prefer variants/classNames to inline Tailwind where possible.
- Use cn for conditional classes; prefer typography and other shared helpers for consistency.
- Keep SMUI unstyled by default; apply styles via variants in the app layer.

Files and naming
- Feature modules use folders under modules/<feature>.
- Filenames: kebab‑case; Components: PascalCase; hooks: camelCase with use prefix.
- Barrel exports only when it simplifies imports and doesn’t hide structure.

Imports
- Group external, then internal. Use "@/…" for app paths, "~/" for SMUI.
- Keep import lists tidy; remove unused imports.

Accessibility
- Set aria-label where appropriate.
- Respect selectionMode and selectionBehavior semantics.
- Preserve focus states; don’t suppress keyboard affordances.

Testing
- Unit test model parse helpers and list/order utilities.
- Component tests cover accessibility states and critical flows (capture, reorder, snooze, complete).

----------------------------------------------------------------

## Common Patterns and Snippets

Instant write via model helper (update)
```ts
// Build validated data with the model helper
const { id, data } = parseTaskUpdateInput({ id: taskId, status: "current" })
// Perform a minimal, focused transaction
db.transact(db.tx.tasks[id].merge(data))
```

Instant write with link (create and relate)
```ts
const { id, data, link } = parseScopeCreateInput({ title, icon_variant })
db.transact([
  db.tx.scopes[id].create(data),
  // If the model returned a link object, include it rather than crafting your own
  link && db.tx.links.create(link),
].filter(Boolean))
```

Persisting DnD ordering (account‑level current tasks)
```ts
const newOrder = reorderIds({
  prevOrder: tasks.map(t => t.id),
  droppedIds: [...e.keys] as string[],
  targetId: e.target.key as string,
  dropPosition: e.target.dropPosition,
})
const { data } = parseAccountUpdateInput({ list_orders: { "tasks/current": newOrder } })
db.transact(db.tx.accounts[instantAccount.id].merge(data))
```

Presenting a list with stable order and sensible fallback
```ts
const tasks = sortItemsByIdOrder({
  items: queriedTasks ?? [],
  idOrder: instantAccount?.list_orders?.["tasks/current"] ?? [],
  missingIdsPosition: "start",
  sortMissingIds(a, b) {
    // Example: newest “current” first when not in idOrder
    return (b.status_time ?? 0) - (a.status_time ?? 0)
  },
})
```

Accessible RAC + SMUI list with DnD and selection
```tsx
<GridList
  aria-label="Current Tasks"
  variants={{ variant: "task-list" }}
  items={tasks}
  selectionMode="multiple"
  selectionBehavior="replace"
  onSelectionChange={onSelectionChange}
  classNames={{ base: "gap-2" }}
  dragAndDropHooks={dragAndDropHooks}
  renderEmptyState={() => <ZeroButton />}
/>
```

DnD data keys: serialize minimal, stable data
```ts
const { dragAndDropHooks } = useDragAndDrop({
  getItems: (keys) => processItemKeys(keys, tasks, "db/task/current"),
  // ...
})
```

Selection pruning when the visible set changes
```ts
useEffect(() => {
  const visible = new Set(tasks.map(t => t.id))
  setSelected(ids => ids.filter(id => visible.has(id)))
}, [tasks])
```

----------------------------------------------------------------

## When in Doubt, Ask

If a requirement is ambiguous (schema fields, list_orders keys, view names, or cross‑scope behaviors), ask a focused question before changing code. Propose a minimal plan, then implement.
