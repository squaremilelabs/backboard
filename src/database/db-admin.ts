import { init } from "@instantdb/admin"
import schema from "./instant.schema"

export const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID as string,
  adminToken: process.env.INSTANT_APP_ADMIN_TOKEN as string,
  schema: schema,
})
