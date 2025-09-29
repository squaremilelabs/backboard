"use client"

import { useQueryState, parseAsStringLiteral, parseAsBoolean } from "nuqs"
import { TaskStatus } from "@/database/models/task"

export const useStatusQueryState = () =>
  useQueryState(
    "status",
    parseAsStringLiteral(["current", "snoozed", "done"] as TaskStatus[]).withDefault("current")
  )

export const useScopeQueryState = () => useQueryState("scope")

export const useShowInactiveScopesQueryState = () =>
  useQueryState("show-inactive-scopes", parseAsBoolean.withDefault(false))
