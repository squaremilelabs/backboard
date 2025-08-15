"use client"
import { SignedIn, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import {
  CircleCheckBigIcon,
  ClipboardCheckIcon,
  ClipboardIcon,
  DiamondIcon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  HeartHandshakeIcon,
  InfoIcon,
  Laptop2Icon,
  MapIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useCopyToClipboard } from "usehooks-ts"
import { getLocalTimeZone } from "@internationalized/date"
import { FEEDBACK_URL, INTEGRATE_WITH_ZAPIER_URL, ROADMAP_URL } from "./links"
import { cn } from "~/smui/utils"
import { Icon } from "~/smui/icon/components"
import { Button } from "~/smui/button/components"
import { useAccountOpenTasks } from "@/modules/task/task-total-count"
import { ToggleButton, ToggleButtonGroup } from "~/smui/toggle-button/components"
import { typography } from "@/common/components/class-names"
import { useAuth } from "@/modules/auth/use-auth"
import { Modal, ModalTrigger } from "~/smui/modal/components"
import { HourSelect } from "@/common/components/hour-select"
import { AccountCustomWorkHours, parseAccountUpdateInput } from "@/database/models/account"
import { db } from "@/database/db-client"
import { DEFAULT_WORKING_HOURS, isWorkHoursValid } from "@/modules/auth/account-hours"

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
            <Icon icon={nowTaskCount === 0 ? <CircleCheckBigIcon /> : <DiamondIcon />} />
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
            <AppAccountCustomWorkHours />
            <AppThemeSelect />
            <AppRoadmapLinks />
            <AppIntegrateWithZapier />
          </Modal>
        </ModalTrigger>
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

function AppIntegrateWithZapier() {
  const { instantAccount } = useAuth()
  const [copiedText, copy] = useCopyToClipboard()

  const handleCopyApiKey = () => {
    copy(instantAccount?.api_key ?? "INVALID_API_KEY")
  }
  return (
    <div className="flex flex-col">
      <p className={typography({ type: "label", className: "p-4" })}>Integrate with Zapier</p>
      <Link
        className={cn(
          "flex items-center gap-2 p-4 text-sm",
          "text-neutral-text hover:text-base-text cursor-pointer",
          "hover:underline"
        )}
        href={INTEGRATE_WITH_ZAPIER_URL}
        target="_blank"
      >
        <Icon icon={<InfoIcon />} />
        <span className="grow">Learn More</span>
        <Icon icon={<ExternalLinkIcon />} />
      </Link>
      <Button
        className={cn(
          "flex items-center gap-2 p-4 text-sm",
          "text-neutral-text hover:text-base-text cursor-pointer",
          "hover:underline"
        )}
        onPress={handleCopyApiKey}
      >
        <Icon icon={copiedText ? <ClipboardCheckIcon /> : <ClipboardIcon />} />
        <span className="grow text-left">{copiedText ? "Keep this safe!" : "Copy API Key"}</span>
      </Button>
    </div>
  )
}

// TODO: Refactor into separate component

function AppAccountCustomWorkHours() {
  const { instantAccount } = useAuth()

  const values = instantAccount?.custom_work_hours || DEFAULT_WORKING_HOURS

  const setValues = (newValues: Omit<AccountCustomWorkHours, "tz">) => {
    if (!instantAccount) return null
    const { data } = parseAccountUpdateInput({
      custom_work_hours: {
        tz: getLocalTimeZone(),
        ...newValues,
      },
    })
    db.transact(db.tx.accounts[instantAccount.id].update(data))
  }

  const handleSelectionChange = (key: keyof AccountCustomWorkHours, value: number | "empty") => {
    if (key === "mid" && value === "empty") {
      setValues({ ...values, mid: null, last: null })
    } else {
      const pendingValues = { ...values, [key]: value === "empty" ? null : value }
      if (!isWorkHoursValid(pendingValues)) {
        const startValue = key === "start" ? (value as number) : values.start
        setValues({ start: startValue, mid: null, last: null })
      } else {
        setValues({ ...values, [key]: value === "empty" ? null : value })
      }
    }
  }

  const endOfNextDay = 23 + values.start
  return (
    <div className="flex flex-col">
      <p className={typography({ type: "label", className: "p-4" })}>My Hours</p>
      <HourSelect
        label="Start of day"
        selectedKey={values.start}
        onSelectionChange={(key) => handleSelectionChange("start", key as number)}
        min={0}
        max={values.mid ? Math.min(values.mid - 1, 12) : 12}
      />
      <HourSelect
        label="Later today means..."
        selectedKey={values.mid ?? null}
        onSelectionChange={(key) => handleSelectionChange("mid", key as number | "empty")}
        min={values.start + 1}
        max={values.last ? values.last - 1 : endOfNextDay}
        allowEmpty
      />
      {!!values.mid && (
        <HourSelect
          label="Later tonight means..."
          selectedKey={values.last ?? null}
          onSelectionChange={(key) => handleSelectionChange("last", key as number | "empty")}
          isDisabled={!values.mid}
          min={(values.mid ?? values.start) + 1}
          max={endOfNextDay}
          allowEmpty
        />
      )}
    </div>
  )
}
