// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/admin"

const rules = {
  accounts: {
    allow: {
      $default: "IS_SELF",
    },
    bind: ["IS_SELF", "auth.id in data.ref('user.id')"],
  },
  // TODO: REMOVE
  // inboxes: {
  //   allow: {
  //     $default: "IS_OWNER",
  //   },
  //   bind: ["IS_OWNER", "auth.id in data.ref('owner.user.id')"],
  // },
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
    bind: [
      // TODO: REMOVE
      // "IS_OWNER_OF_INBOX",
      // "auth.id in data.ref('inbox.owner.user.id')",
      "IS_OWNER_OF_SCOPE",
      "auth.id in data.ref('scope.owner.user.id')",
    ],
  },
  recurring_tasks: {
    allow: {
      $default: "IS_OWNER_OF_SCOPE",
    },
    bind: [
      // TODO: REMOVE
      // "IS_OWNER_OF_INBOX",
      // "auth.id in data.ref('inbox.owner.user.id')",
      "IS_OWNER_OF_SCOPE",
      "auth.id in data.ref('scope.owner.user.id')",
    ],
  },
} satisfies InstantRules

export default rules
