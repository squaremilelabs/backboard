// "use client"

// import { TreeListScopeItem } from "./scope-item"
// import { useViewParams } from "@/hooks/use-view-params"
// import { useViewTreeData, ViewTreeItem } from "@/hooks/use-view-tree-data"
// import { SMUIDataTreeList } from "~/smui/components/data-tree-list"

// export function TreeList() {
//   const { viewParams } = useViewParams()
//   const { items } = useViewTreeData({ viewParams })

//   return (
//     <SMUIDataTreeList
//       ariaLabel="List"
//       items={items}
//       renderItemContent={(item, renderProps) => {
//         if (item.kind === "scope")
//           return (
//             <TreeListScopeItem
//               scopeItem={item as ViewTreeItem<"scope">}
//               renderProps={renderProps}
//             />
//           )
//       }}
//     />
//   )
// }
