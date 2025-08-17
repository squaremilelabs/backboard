"use client"
import Link from "next/link"
import { ClipboardCheckIcon, ClipboardIcon, ExternalLinkIcon, InfoIcon } from "lucide-react"
import { useCopyToClipboard } from "usehooks-ts"
import { INTEGRATE_WITH_ZAPIER_URL } from "../links"
import { cn } from "~/smui/utils"
import { Icon } from "~/smui/icon/components"
import { Button } from "~/smui/button/components"
import { typography } from "@/common/components/class-names"
import { useAuth } from "@/modules/auth/use-auth"

export function AppUserTrayIntegrationInfo() {
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
