import "./env.js"
import * as Sentry from "@sentry/node"
import { isProduction } from "./env.js"

const sentryDsn = process.env.SENTRY_DSN

export const isSentryEnabled = isProduction && Boolean(sentryDsn)

if (isSentryEnabled) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
  })
}

export { Sentry }
