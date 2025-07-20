// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react"

const rules = {
  $users: {
    allow: {
      view: "true",
    },
  },
  tasks: {
    allow: {
      $default: "auth.id in data.ref('owner.id')",
      create: "true",
    },
  },
  inboxes: {
    allow: {
      $default: "auth.id in data.ref('owner.id')",
      create: "true",
    },
  },
} satisfies InstantRules

export default rules
