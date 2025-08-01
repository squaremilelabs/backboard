import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Only protect app pages (not API routes)
const isProtectedRoute = createRouteMatcher(["/inbox(.*)"])

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { isAuthenticated } = await auth()
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }
})
