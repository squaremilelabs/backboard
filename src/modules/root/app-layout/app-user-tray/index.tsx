"use client"
import { SignedIn, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { DiamondIcon, EllipsisVerticalIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { AppUserTrayContributeLinks } from "./contribute-links"
import { AppUserTrayIntegrationInfo } from "./integration-info"
import { AppUserTrayWorkHours } from "./work-hours"
import { AppUserTrayThemeSelect } from "./theme-select"
import { cn } from "~/smui/utils"
import { Icon } from "~/smui/icon/components"
import { Button } from "~/smui/button/components"
import { useAccountOpenTasks } from "@/modules/task/task-total-count"
import { Modal, ModalTrigger } from "~/smui/modal/components"

export function AppUserTray() {
  const pathname = usePathname()
  const { tasks: nowTasks } = useAccountOpenTasks()
  const nowTaskCount = nowTasks?.length || 0
  return (
    <SignedIn>
      <div className="flex items-center gap-8">
        {pathname !== "/current" && (
          <Link
            href="/current"
            className={cn(
              "flex items-center justify-center gap-2",
              "font-bold",
              "hover:opacity-70",
              nowTaskCount > 0
                ? "text-primary-text border-primary-text"
                : "text-neutral-muted-text hover:text-primary-text"
            )}
          >
            <Icon icon={<DiamondIcon />} />
            {nowTaskCount}
          </Link>
        )}
        <div />
        <UserButton />
        <ModalTrigger>
          <Button className={["flex items-center gap-2"]}>
            <Icon
              icon={<EllipsisVerticalIcon />}
              variants={{ size: "md" }}
              className="text-neutral-muted-text"
            />
          </Button>
          <Modal
            isDismissable
            variants={{ variant: "drawer", drawerPosition: "right" }}
            classNames={{
              content: [
                "bg-base-bg transition-all",
                "w-xs starting:w-0",
                "flex flex-col gap-8 p-8",
              ],
            }}
            dialogProps={{ "aria-label": "User Tray" }}
          >
            <AppUserTrayWorkHours />
            <AppUserTrayThemeSelect />
            <AppUserTrayContributeLinks />
            <AppUserTrayIntegrationInfo />
          </Modal>
        </ModalTrigger>
      </div>
    </SignedIn>
  )
}
