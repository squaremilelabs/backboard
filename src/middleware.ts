import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getAccountFromApiRequest } from "./modules/auth/api-auth"

const isClerkProtectedRoute = createRouteMatcher(["/scope(.*)", "/current(.*)"])
const isApiRoute = createRouteMatcher(["/api(.*)"])
const isCronRoute = createRouteMatcher(["/api/jobs(.*)"])

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}

export default clerkMiddleware(async (auth, req) => {
  if (isClerkProtectedRoute(req)) {
    const { isAuthenticated } = await auth()
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }
  if (isApiRoute(req)) {
    if (isCronRoute(req)) {
      /* CRON API AUTHENTICATION */
      const authHeader = req.headers.get("authorization")
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", { status: 401 })
      }
    } else {
      /* API KEY AUTHENTICATION */
      const account = await getAccountFromApiRequest(req)
      if (!account) {
        return new Response("Unauthorized", { status: 401 })
      }
    }
  }
})
