// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react"

const rules = {
  accounts: {
    allow: {
      $default: "IS_SELF",
    },
    bind: ["IS_SELF", "auth.id in data.ref('user.id')"],
  },
  inboxes: {
    allow: {
      $default: "IS_OWNER",
    },
    bind: ["IS_OWNER", "auth.id in data.ref('owner.user.id')"],
  },
  tasks: {
    allow: {
      $default: "IS_OWNER_OF_INBOX && IS_VALID_INBOX_STATE",
    },
    bind: [
      "IS_OWNER_OF_INBOX",
      "auth.id in data.ref('inbox.owner.user.id')",
      "IS_VALID_INBOX_STATE",
      "data.inbox_state in ['open', 'snoozed', 'archived']",
    ],
  },
} satisfies InstantRules

export default rules
