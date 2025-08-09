// "use client"

// import React, { useEffect, useState } from "react"
// import { Form, Group, Input, Label, NumberField } from "react-aria-components"
// import { MinusIcon, PlusIcon } from "lucide-react"
// import { useCurrentScopeView } from "../scope/use-scope-views"
// import { Modal, ModalTrigger } from "~/smui/modal/components"
// import { TextField, TextFieldInput, TextFieldTextArea } from "~/smui/text-field/components"
// import { FieldLabel } from "~/smui/field/components"
// import { Select, SelectButton, SelectPopover } from "~/smui/select/components"
// import { ListBox, ListBoxItem } from "~/smui/list-box/components"
// import { ToggleButton, ToggleButtonGroup } from "~/smui/toggle-button/components"
// import { Button } from "~/smui/button/components"
// import { Icon } from "~/smui/icon/components"
// import { Checkbox } from "~/smui/checkbox/components"
// import { typography } from "@/common/components/class-names"
// import { RecurringTask } from "@/database/models/recurring-task"

// // TODO: REFACTOR

// export function RecurringTaskModal({
//   isOpen,
//   onOpenChange,
//   existingTask,
//   children,
// }: {
//   isOpen: boolean
//   onOpenChange: (isOpen: boolean) => void
//   existingTask?: RecurringTask
//   children: React.ReactNode
// }) {
//   const { id: inboxId } = useCurrentScopeView()
//   const [values, setValues] = useState<Pick<RecurringTask, "title" | "content" | "frequency">>({
//     title: "",
//     content: "",
//     frequency: { type: "daily" },
//   })

//   useEffect(() => {
//     if (existingTask) {
//       setValues({
//         title: existingTask.title,
//         content: existingTask.content,
//         frequency: existingTask.frequency,
//       })
//     }
//   }, [existingTask])

//   const handleFrequencyTypeChange = (type: RecurringTaskFrequency["type"]) => {
//     if (type === "daily") {
//       setValues({
//         ...values,
//         frequency: { type: "daily" },
//       })
//     }

//     if (type === "weekly") {
//       setValues({
//         ...values,
//         frequency: { type: "weekly", weekday: 1 }, // Default to Monday
//       })
//     }

//     if (type === "monthly") {
//       setValues({
//         ...values,
//         frequency: { type: "monthly", day: 1 }, // Default to the 1st of the month
//       })
//     }
//   }

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()

//     // Validate values in state, end function early if invalid
//     if (!values.title.trim()) return
//     if (values.frequency.type === "weekly" && values.frequency.weekday === undefined) return
//     if (
//       values.frequency.type === "monthly" &&
//       (values.frequency.day < 1 || values.frequency.day > 31)
//     )
//       return

//     // Handle update existing logic

//     if (existingTask) {
//       updateRecurringTask(existingTask.id, {
//         title: values.title,
//         content: values.content || "",
//         frequency: values.frequency,
//       }).then(() => {
//         onOpenChange(false)
//       })
//     } else {
//       createRecurringTask({
//         inbox_id: inboxId,
//         title: values.title,
//         content: values.content || "",
//         frequency: values.frequency,
//       }).then(() => {
//         onOpenChange(false)
//         setValues({ title: "", content: "", frequency: { type: "daily" } })
//       })
//     }
//   }

//   const handleArchive = () => {
//     if (existingTask) {
//       updateRecurringTask(existingTask.id, { is_archived: true }).then(() => {
//         onOpenChange(false)
//       })
//     }
//   }

//   return (
//     <ModalTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
//       {children}
//       <Modal
//         isDismissable
//         variants={{ size: "sm" }}
//         classNames={{
//           content: ["p-16", "flex flex-col gap-16 border bg-base-bg"],
//         }}
//       >
//         <p className="text-neutral-muted-text text-sm">
//           🚧 Sorry! Haven&apos;t updated this UI yet!
//         </p>
//         <Form className="flex flex-col gap-8" onSubmit={handleSubmit}>
//           <TextField
//             aria-label="Title"
//             name="title"
//             value={values.title}
//             onChange={(value) => setValues({ ...values, title: value })}
//             autoFocus
//             classNames={{
//               base: "flex flex-col gap-2",
//               input: "w-full p-8 border bg-base-bg",
//               field: {
//                 label: "text-sm font-semibold text-neutral-text",
//               },
//             }}
//           >
//             {(_, classNames) => (
//               <>
//                 <FieldLabel className={typography({ type: "label" })}>Title</FieldLabel>
//                 <TextFieldInput className={classNames.input} />
//               </>
//             )}
//           </TextField>
//           <TextField
//             aria-label="Content"
//             name="content"
//             value={values.content}
//             onChange={(value) => setValues({ ...values, content: value })}
//             classNames={{
//               base: "flex flex-col gap-2",
//               textarea: "w-full p-8 border bg-base-bg resize-none",
//               field: {
//                 label: "text-sm font-semibold text-neutral-text",
//               },
//             }}
//           >
//             {(_, classNames) => (
//               <>
//                 <FieldLabel className={typography({ type: "label" })}>Content</FieldLabel>
//                 <TextFieldTextArea className={classNames.textarea} spellCheck={false} minRows={3} />
//               </>
//             )}
//           </TextField>
//           <div className="flex flex-col gap-2">
//             <span className={typography({ type: "label" })}>Frequency</span>
//             <ToggleButtonGroup
//               selectedKeys={[values.frequency.type]}
//               selectionMode="single"
//               onSelectionChange={(keys) => {
//                 const type = [...keys][0] as RecurringTaskFrequency["type"]
//                 handleFrequencyTypeChange(type)
//               }}
//               classNames={{
//                 base: "flex items-center gap-4",
//                 button: [
//                   "grow p-4 border text-sm",
//                   "cursor-pointer hover:bg-neutral-muted-bg/50",
//                   "data-selected:bg-neutral-bg",
//                   "data-selected:text-neutral-fg",
//                   "data-selected:border-neutral-border",
//                   "data-selected:font-medium",
//                 ],
//               }}
//             >
//               {(renderProps, classNames) => (
//                 <>
//                   <ToggleButton id="daily" className={classNames.button}>
//                     Daily
//                   </ToggleButton>
//                   <ToggleButton id="weekly" className={classNames.button}>
//                     Weekly
//                   </ToggleButton>
//                   <ToggleButton id="monthly" className={classNames.button}>
//                     Monthly
//                   </ToggleButton>
//                 </>
//               )}
//             </ToggleButtonGroup>
//           </div>
//           {values.frequency.type === "daily" && (
//             <Checkbox
//               isSelected={values.frequency.skip_weekends === true}
//               onChange={(value) =>
//                 setValues({ ...values, frequency: { type: "daily", skip_weekends: value } })
//               }
//               variants={{ variant: "reset" }}
//               classNames={{
//                 base: [
//                   "flex items-center py-4 gap-4 cursor-pointer text-neutral-muted-text",
//                   "data-selected:text-neutral-text",
//                   "hover:text-neutral-text",
//                 ],
//                 icon: "size-16",
//               }}
//             >
//               Skip weekends
//             </Checkbox>
//           )}
//           {values.frequency.type === "weekly" && (
//             <Select
//               selectedKey={values.frequency.weekday}
//               onSelectionChange={(key) =>
//                 setValues({ ...values, frequency: { type: "weekly", weekday: key as number } })
//               }
//               placeholder="Select Day"
//               classNames={{
//                 base: "flex flex-col gap-2",
//                 button: {
//                   base: "flex items-center p-8 border bg-base-bg cursor-pointer",
//                   value: "text-left grow",
//                   icon: "size-16",
//                 },
//                 field: {
//                   label: "text-sm font-semibold text-neutral-text",
//                 },
//                 popover: "w-(--trigger-width) bg-base-bg border",
//               }}
//             >
//               {(_, classNames) => (
//                 <>
//                   <FieldLabel className={typography({ type: "label" })}>Day of Week</FieldLabel>
//                   <SelectButton classNames={classNames.button}>
//                     {({ defaultChildren }) => defaultChildren}
//                   </SelectButton>
//                   <SelectPopover className={classNames.popover}>
//                     <ListBox
//                       items={WEEKDAY_OPTIONS}
//                       classNames={{
//                         base: [],
//                         item: [
//                           "cursor-pointer hover:bg-neutral-muted-bg",
//                           "px-8 py-4 text-neutral-muted-text",
//                           "data-selected:bg-neutral-bg data-selected:text-neutral-fg data-selected:font-medium",
//                         ],
//                       }}
//                     >
//                       {(item, classNames) => (
//                         <ListBoxItem
//                           id={item.value}
//                           textValue={item.label}
//                           className={classNames.item}
//                         >
//                           {item.label}
//                         </ListBoxItem>
//                       )}
//                     </ListBox>
//                   </SelectPopover>
//                 </>
//               )}
//             </Select>
//           )}
//           {values.frequency.type === "monthly" && (
//             // TODO: Update to SMUI
//             <NumberField
//               value={values.frequency.day}
//               onChange={(value) => {
//                 setValues({ ...values, frequency: { type: "monthly", day: value } })
//               }}
//               minValue={1}
//               maxValue={31}
//             >
//               <Label className={typography({ type: "label" })}>Day of Month</Label>
//               <Group className="flex items-stretch">
//                 <Button
//                   slot="decrement"
//                   className="bg-neutral-muted-bg cursor-pointer border px-4 hover:opacity-80"
//                 >
//                   <Icon icon={<MinusIcon />} />
//                 </Button>
//                 <Input className="w-100 border p-4 text-center" />
//                 <Button
//                   slot="increment"
//                   className="bg-neutral-muted-bg cursor-pointer border px-4 hover:opacity-80"
//                 >
//                   <Icon icon={<PlusIcon />} />
//                 </Button>
//               </Group>
//             </NumberField>
//           )}
//           <Button
//             className="bg-neutral-muted-bg text-neutral-muted-fg border-neutral-muted-border
//               cursor-pointer border p-8 font-medium hover:opacity-80"
//             type="submit"
//           >
//             Save
//           </Button>
//           {existingTask ? (
//             <Button
//               className="text-neutral-muted-text cursor-pointer text-left text-sm hover:underline"
//               onPress={handleArchive}
//             >
//               Archive
//             </Button>
//           ) : null}
//         </Form>
//       </Modal>
//     </ModalTrigger>
//   )
// }

// const WEEKDAY_OPTIONS = [
//   { value: 0, label: "Sundays" },
//   { value: 1, label: "Mondays" },
//   { value: 2, label: "Tuesdays" },
//   { value: 3, label: "Wednesdays" },
//   { value: 4, label: "Thursdays" },
//   { value: 5, label: "Fridays" },
//   { value: 6, label: "Saturdays" },
// ]
