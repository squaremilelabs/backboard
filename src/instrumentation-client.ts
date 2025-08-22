import { Sentry } from "~/sentry/sdk"
import "~/sentry/client.config"
export const onRouterTransitionStart = Sentry?.captureRouterTransitionStart
