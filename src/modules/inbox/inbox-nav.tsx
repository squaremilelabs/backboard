import { InboxNavCreateForm } from "./inbox-nav-create-form"
import { InboxNavList } from "./inbox-nav-list"

export function InboxNav() {
  return (
    <div className="flex flex-col divide-y">
      <InboxNavList />
      <InboxNavCreateForm />
    </div>
  )
}
