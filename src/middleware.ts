import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Only protect app pages (not API routes)
const isProtectedRoute = createRouteMatcher([
  "/((?!api/).*)", // Protect all routes except those starting with /api/
])

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})
