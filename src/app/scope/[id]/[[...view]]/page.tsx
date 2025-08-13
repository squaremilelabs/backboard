import { Metadata } from "next"
import { currentUser } from "@clerk/nextjs/server"
import { ScopePageRouter } from "@/modules/scope/scope-page-router"
import { Scope } from "@/database/models/scope"
import { db } from "@/database/db-admin"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const user = await currentUser()
  const { id: scopeId } = await params
  const scopeQuery = await db
    .asUser({ email: user?.primaryEmailAddress?.emailAddress ?? "none@none.com" })
    .query({
      scopes: {
        $: {
          where: { id: scopeId },
          first: 1,
        },
      },
    })
  const scope = scopeQuery.scopes?.[0] as Scope | undefined
  if (scope?.title) {
    let title = scope.title
    if (scope?.icon?.type === "emoji") {
      if (scope.icon.char) {
        title = `${scope.icon.char} ${title}`
      }
    }
    return { title }
  }
  return {}
}

export default ScopePageRouter
