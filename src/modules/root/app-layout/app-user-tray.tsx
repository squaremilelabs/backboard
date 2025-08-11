"use client"
import { SignedIn, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import {
  CircleCheckBigIcon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  HeartHandshakeIcon,
  Laptop2Icon,
  MapIcon,
  MoonIcon,
  SparkleIcon,
  SunIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { FEEDBACK_URL, ROADMAP_URL } from "./links"
import { cn } from "~/smui/utils"
import { Icon } from "~/smui/icon/components"
import { Popover, PopoverTrigger } from "~/smui/popover/components"
import { Button } from "~/smui/button/components"
import { useAccountOpenTasks } from "@/modules/task/task-total-count"
import { ToggleButton, ToggleButtonGroup } from "~/smui/toggle-button/components"
import { typography } from "@/common/components/class-names"

export function AppUserTray() {
  const pathname = usePathname()
  const { tasks: nowTasks } = useAccountOpenTasks()
  const nowTaskCount = nowTasks?.length || 0
  return (
    <SignedIn>
      <div className="flex items-center gap-4">
        {pathname !== "/current" && (
          <Link
            href="/current"
            className={cn(
              "flex items-center justify-center gap-2 px-4",
              "font-bold",
              "hover:opacity-70",
              nowTaskCount > 0
                ? "text-primary-text border-primary-text"
                : "text-neutral-muted-text hover:text-primary-text"
            )}
          >
            <Icon icon={nowTaskCount === 0 ? <CircleCheckBigIcon /> : <SparkleIcon />} />
            {nowTaskCount}
          </Link>
        )}
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
        href={ROADMAP_URL}
        target="_blank"
      >
        <Icon icon={<MapIcon />} />
        <span className="grow">Product Roadmap</span>
        <Icon icon={<ExternalLinkIcon />} />
      </Link>
      <Link
        className={cn(
          "flex items-center gap-2 p-4 text-sm",
          "text-neutral-text hover:text-base-text cursor-pointer",
          "hover:underline"
        )}
        href={FEEDBACK_URL}
        target="_blank"
      >
        <Icon icon={<HeartHandshakeIcon />} />
        <span className="grow">Submit Feedback</span>
        <Icon icon={<ExternalLinkIcon />} />
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
