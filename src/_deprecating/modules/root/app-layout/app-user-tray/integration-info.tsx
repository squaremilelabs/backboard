"use client"
import { ClipboardCheckIcon, ClipboardIcon, ExternalLinkIcon, InfoIcon } from "lucide-react"
import Link from "next/link"
import { useCopyToClipboard } from "usehooks-ts"
import { typography } from "@/_deprecating/common/components/class-names"
import { Button } from "@/_deprecating/common/primitives/button/components"
import { Icon } from "@/_deprecating/common/primitives/icon/components"
import { cn } from "@/_deprecating/common/utils/ui-utils"
import { useAuth } from "@/hooks/use-auth"
import { INTEGRATION_INFO_URL } from "../links"

export function AppUserTrayIntegrationInfo() {
  const { account } = useAuth()
  const [copiedText, copy] = useCopyToClipboard()

  const handleCopyApiKey = () => {
    copy(account?.api_key ?? "INVALID_API_KEY")
  }
  return (
    <div className="flex flex-col">
      <p className={typography({ type: "label", className: "p-4" })}>Build Integrations</p>
      <Link
        className={cn(
          "flex items-center gap-2 p-4 text-sm",
          "text-neutral-text hover:text-base-text cursor-pointer",
          "hover:underline"
        )}
        href={INTEGRATION_INFO_URL}
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
