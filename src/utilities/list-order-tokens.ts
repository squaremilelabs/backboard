/**
 * Utilities for view-level ordering token management.
 * Tokens encode both kind and id so a single string[] can represent heterogeneous ordering.
 *
 * Token forms:
 *  - scope:{uuid}
 *  - task:{uuid}
 *  - rtask:{uuid}
 */

export type OrderTokenKind = "scope" | "task" | "rtask"

const TOKEN_REGEX = /^(scope|task|rtask):(.+)$/

export interface DecodedToken {
  kind: OrderTokenKind
  id: string
}

export function encodeToken(kind: OrderTokenKind, id: string): string {
  return `${kind}:${id}`
}

export function decodeToken(token: string): DecodedToken | null {
  const m = TOKEN_REGEX.exec(token)
  if (!m) return null
  return { kind: m[1] as OrderTokenKind, id: m[2] }
}

/** Remove tokens whose decoded ids are in removeIds (matching both kind & id). */
export function removeTokens(tokens: string[], remove: Set<string>): string[] {
  return tokens.filter((t) => {
    const d = decodeToken(t)
    if (!d) return false // drop invalid
    return !remove.has(`${d.kind}:${d.id}`)
  })
}

/** Ensure uniqueness preserving first occurrence order. */
export function dedupeTokens(tokens: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of tokens) {
    const d = decodeToken(t)
    if (!d) continue
    const key = `${d.kind}:${d.id}`
    if (!seen.has(key)) {
      seen.add(key)
      out.push(`${d.kind}:${d.id}`) // normalize formatting
    }
  }
  return out
}

/** Insert newTokens array into base at index (0..base.length). */
export function insertTokens(base: string[], index: number, newTokens: string[]): string[] {
  return [...base.slice(0, index), ...newTokens, ...base.slice(index)]
}

/**
 * Build a fallback ordering for a container when no explicit per-view token array exists yet.
 * Scopes-first rule (user preference), then view-specific item type (tasks of matching status OR recurring tasks for recurring view).
 */
export function buildFallbackTokens(args: {
  view: "current" | "snoozed" | "done" | "recurring"
  scopeIds: string[]
  taskIds: string[]
  rtaskIds: string[]
}): string[] {
  const { view, scopeIds, taskIds, rtaskIds } = args
  const tokens: string[] = []
  for (const sid of scopeIds) tokens.push(encodeToken("scope", sid))
  if (view === "recurring") {
    for (const rid of rtaskIds) tokens.push(encodeToken("rtask", rid))
  } else {
    for (const tid of taskIds) tokens.push(encodeToken("task", tid))
  }
  return tokens
}

/** Given token list, return ordered lists of ids segregated by kind (filter invalid kinds). */
export function partitionTokens(tokens: string[]) {
  const scopes: string[] = []
  const tasks: string[] = []
  const rtasks: string[] = []
  for (const t of tokens) {
    const d = decodeToken(t)
    if (!d) continue
    if (d.kind === "scope") scopes.push(d.id)
    else if (d.kind === "task") tasks.push(d.id)
    else if (d.kind === "rtask") rtasks.push(d.id)
  }
  return { scopes, tasks, rtasks }
}
