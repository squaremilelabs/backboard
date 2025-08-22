type SentryType = typeof import("@sentry/nextjs")

let Sentry: SentryType | undefined
if (process.env.NODE_ENV === "production") {
  import("@sentry/nextjs").then((sentry) => {
    Sentry = sentry.default
  })
}
export { Sentry }
