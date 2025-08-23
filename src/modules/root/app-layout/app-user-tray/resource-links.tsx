"use client"
import Link from "next/link"
import { ExternalLinkIcon, HeartHandshakeIcon, MapIcon, ScrollIcon } from "lucide-react"
import { FEEDBACK_URL, PRINCIPLES_URL, ROADMAP_URL } from "../links"
import { cn } from "~/smui/utils"
import { Icon } from "~/smui/icon/components"
import { typography } from "@/common/components/class-names"

export function AppTrayResourceLinks() {
  return (
    <div className="flex flex-col">
      <p className={typography({ type: "label", className: "p-4" })}>Resources</p>
      <Link
        className={cn(
          "flex items-center gap-2 p-4 text-sm",
          "text-neutral-text hover:text-base-text cursor-pointer",
          "hover:underline"
        )}
        href={PRINCIPLES_URL}
        target="_blank"
      >
        <Icon icon={<ScrollIcon />} />
        <span className="grow">The Principles</span>
        <Icon icon={<ExternalLinkIcon />} />
      </Link>
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
