// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/core"

const rules = {
  attrs: {
    allow: {
      $default: "false",
    },
  },
  accounts: {
    allow: {
      $default: "IS_SELF",
    },
    bind: ["IS_SELF", "auth.id in data.ref('user.id')"],
  },
  scopes: {
    allow: {
      $default: "IS_OWNER",
    },
    bind: ["IS_OWNER", "auth.id in data.ref('owner.user.id')"],
  },
  tasks: {
    allow: {
      $default: "IS_OWNER_OF_SCOPE",
    },
    bind: ["IS_OWNER_OF_SCOPE", "auth.id in data.ref('scope.owner.user.id')"],
  },
  recurring_tasks: {
    allow: {
      $default: "IS_OWNER_OF_SCOPE",
    },
    bind: ["IS_OWNER_OF_SCOPE", "auth.id in data.ref('scope.owner.user.id')"],
  },
} satisfies InstantRules

export default rules
