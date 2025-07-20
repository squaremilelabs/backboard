import { InstaQLEntity } from "@instantdb/react"
import { AppSchema } from "./instant.schema"

export type Task = InstaQLEntity<AppSchema, "tasks">
export type Inbox = InstaQLEntity<AppSchema, "inboxes">
