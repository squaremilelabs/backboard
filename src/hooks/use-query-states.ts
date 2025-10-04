import { parseAsBoolean, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs"
import { TaskStatus } from "@/database/models/task"

export function useQueryStates() {
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(["current", "snoozed", "done"] as TaskStatus[]).withDefault("current")
  )
  const [scope, setScope] = useQueryState("scope", parseAsString.withDefault("root"))
  const [showInactiveScopes, setShowInactiveScopes] = useQueryState(
    "show-inactive-scopes",
    parseAsBoolean.withDefault(false)
  )

  return {
    status,
    setStatus,
    scope,
    setScope,
    showInactiveScopes,
    setShowInactiveScopes,
  }
}
