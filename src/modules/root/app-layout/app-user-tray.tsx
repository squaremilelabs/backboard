"use client"
import { SignedIn, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import {
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  Laptop2Icon,
  MoonIcon,
  SunIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "~/smui/utils"
import { Icon } from "~/smui/icon/components"
import { Popover, PopoverTrigger } from "~/smui/popover/components"
import { Button } from "~/smui/button/components"
import { TaskTotalCount } from "@/modules/task/task-total-count"
import { ToggleButton, ToggleButtonGroup } from "~/smui/toggle-button/components"
import { typography } from "@/common/components/class-names"

export function AppUserTray() {
  return (
    <SignedIn>
      <div className="flex items-center gap-4">
        <TaskTotalCount />
        <div />
        <UserButton />
        <PopoverTrigger>
          <Button className="text-neutral-muted-text hover:text-primary-text">
            <Icon
              icon={<EllipsisVerticalIcon />}
              className="!w-fit !min-w-fit"
              variants={{ size: "md" }}
            />
          </Button>
          <Popover
            placement="bottom right"
            classNames={{
              content: "flex flex-col bg-base-bg border-2 rounded-sm p-8 gap-8 w-200",
            }}
          >
            <AppThemeSelect />
            <AppRoadmapLinks />
          </Popover>
        </PopoverTrigger>
      </div>
    </SignedIn>
  )
}

function AppRoadmapLinks() {
  return (
    <div className="flex flex-col">
      <p className={typography({ type: "label", className: "p-4" })}>Contribute</p>
      <Link
        className={cn(
          "flex items-center gap-2 p-4 text-sm",
          "text-neutral-text hover:text-base-text cursor-pointer",
          "hover:underline"
        )}
        href="https://squaremilelabs.notion.site/Backboard-Roadmap-23baece5ba1180b59daec44a563d2e86"
        target="_blank"
      >
        <Icon icon={<ExternalLinkIcon />} />
        Roadmap
      </Link>
      <Link
        className={cn(
          "flex items-center gap-2 p-4 text-sm",
          "text-neutral-text hover:text-base-text cursor-pointer",
          "hover:underline"
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

function AppThemeSelect() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex flex-col">
      <p className={typography({ type: "label", className: "p-4" })}>Theme</p>
      <ToggleButtonGroup
        selectedKeys={[theme || "system"]}
        selectionMode="single"
        onSelectionChange={(keys) => {
          const theme = [...keys][0] as "light" | "dark" | "system"
          setTheme(theme)
        }}
        variants={{ variant: "action-button" }}
        classNames={{
          base: "flex flex-col items-stretch",
          button: [
            "text-neutral-muted-text data-selected:bg-neutral-muted-bg data-selected:text-base-text",
            "data-selected:border rounded-sm",
          ],
        }}
      >
        {(_, classNames) => {
          return (
            <>
              <ToggleButton id="light" className={classNames.button}>
                <Icon icon={<SunIcon />} />
                <span>Light</span>
              </ToggleButton>
              <ToggleButton id="dark" className={classNames.button}>
                <Icon icon={<MoonIcon />} />
                <span>Dark</span>
              </ToggleButton>
              <ToggleButton id="system" className={classNames.button}>
                <Icon icon={<Laptop2Icon />} />
                <span>System</span>
              </ToggleButton>
            </>
          )
        }}
      </ToggleButtonGroup>
    </div>
  )
}
