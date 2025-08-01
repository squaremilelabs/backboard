"use client"

import { SignedIn, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { ExternalLinkIcon, MapIcon } from "lucide-react"
import { cn } from "~/smui/utils"
import { Icon } from "~/smui/icon/components"
import { Popover, PopoverTrigger } from "~/smui/popover/components"
import { Button } from "~/smui/button/components"
import { TaskTotalCount } from "@/modules/task/task-total-count"

export function AppUserTray() {
  return (
    <SignedIn>
      <div className="flex items-center gap-8">
        <PopoverTrigger>
          <Button className="text-neutral-muted-text hover:text-primary-text">
            <Icon icon={<MapIcon />} variants={{ size: "lg" }} />
          </Button>
          <Popover
            placement="bottom right"
            classNames={{
              content: "bg-base-bg border rounded-sm",
            }}
          >
            <AppRoadmapLinks />
          </Popover>
        </PopoverTrigger>
        <TaskTotalCount />
        <UserButton />
      </div>
    </SignedIn>
  )
}

function AppRoadmapLinks() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <Link
        className={cn(
          "flex items-center gap-2 text-sm",
          "text-canvas-3 hover:text-canvas-7 cursor-pointer"
        )}
        href="https://squaremilelabs.notion.site/Backboard-Roadmap-23baece5ba1180b59daec44a563d2e86"
        target="_blank"
      >
        <Icon icon={<ExternalLinkIcon />} />
        Roadmap
      </Link>
      <Link
        className={cn(
          "flex items-center gap-2 text-sm",
          "text-canvas-3 hover:text-canvas-7 cursor-pointer"
        )}
        href="https://squaremilelabs.notion.site/23baece5ba11803880f7cb252029167e"
        target="_blank"
      >
        <Icon icon={<ExternalLinkIcon />} />
        Submit Feedback
      </Link>
    </div>
  )
}
