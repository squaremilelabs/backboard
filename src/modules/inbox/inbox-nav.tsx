import { Link } from "react-aria-components"
import { ExternalLinkIcon } from "lucide-react"
import { InboxNavCreateForm } from "./inbox-nav-create-form"
import { InboxNavList } from "./inbox-nav-list"
import { Icon } from "~/smui/icon/components"
import { cn } from "~/smui/utils"

export function InboxNav() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col divide-y">
        <InboxNavList />
        <InboxNavCreateForm />
      </div>
      <div className="grow" />
      <div className="flex flex-col gap-8 px-8 py-16">
        <Link
          className={cn(
            "flex items-center gap-2",
            "text-canvas-3 hover:text-canvas-6 cursor-pointer"
          )}
          href="https://squaremilelabs.notion.site/Backboard-Roadmap-23baece5ba1180b59daec44a563d2e86"
          target="_blank"
        >
          <Icon icon={<ExternalLinkIcon />} />
          Roadmap
        </Link>
        <Link
          className={cn(
            "flex items-center gap-2",
            "text-canvas-3 hover:text-canvas-6 cursor-pointer"
          )}
          href="https://squaremilelabs.notion.site/23baece5ba11803880f7cb252029167e"
          target="_blank"
        >
          <Icon icon={<ExternalLinkIcon />} />
          Submit Feedback
        </Link>
      </div>
    </div>
  )
}
