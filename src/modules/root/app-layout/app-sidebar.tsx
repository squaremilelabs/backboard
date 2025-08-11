"use client"
import { ChevronsLeftIcon } from "lucide-react"
import { AppLogo } from "./app-logo"
import { ScopeList } from "@/modules/scope/scope-list"
import { useSessionStorageUtility } from "@/common/utils/use-storage-utility"
import { Button } from "~/smui/button/components"
import { Icon } from "~/smui/icon/components"
import { cn } from "~/smui/utils"

export function AppSidebar() {
  const [_, setSidebarOpen] = useSessionStorageUtility("app-sidebar-open", true)
  return (
    <div className="relative flex w-full flex-col overflow-auto p-4">
      <Button
        onPress={() => setSidebarOpen(false)}
        className={cn(
          "sticky top-0 z-10",
          "bg-base-bg/30 backdrop-blur-xl",
          "flex items-center gap-8 p-8 pl-12"
        )}
        variants={{ hover: "fill" }}
      >
        <AppLogo withTitle />
        <div className="grow" />
        <Icon icon={<ChevronsLeftIcon />} className="text-neutral-muted-text !min-w-30" />
      </Button>
      <ScopeList />
    </div>
  )
}

// function NowTaskLink() {
//   const pathname = usePathname()
//   const { tasks: nowTasks } = useAccountOpenTasks()
//   const nowTaskCount = nowTasks?.length || 0

//   const isSelected = pathname === "/now"
//   return (
//     <Link
//       href="/now"
//       className={cn(
//         "flex items-center gap-4 truncate",
//         "rounded-sm px-8 py-6",
//         "text-sm font-medium",
//         "hover:bg-neutral-muted-bg/50",
//         isSelected && "bg-neutral-muted-bg text-base-text border"
//       )}
//     >
//       <Icon
//         icon={nowTaskCount > 0 ? <PlayIcon /> : <CircleCheckBigIcon />}
//         variants={{ size: "sm" }}
//       />
//       <span>
//         {nowTaskCount} task{nowTaskCount === 1 ? "" : "s"} left
//       </span>
//     </Link>
//   )
// }
