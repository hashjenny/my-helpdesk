import * as Sentry from "@sentry/react"

const DSN = "https://5073e905956759a558b80b4e88be6a82@o4511357945053184.ingest.us.sentry.io/4511357989224449"
const isProduction = import.meta.env.PROD

if (isProduction) {
  Sentry.init({
    dsn: DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
}

type LogLevel = "debug" | "info" | "warn" | "error"

const log = (level: LogLevel, message: string, data?: unknown) => {
  const args = data !== undefined ? [message, data] : [message]

  if (isProduction) {
    switch (level) {
      case "debug":
        console.debug(...args)
        break
      case "info":
        console.info(...args)
        break
      case "warn":
        console.warn(...args)
        break
      case "error":
        console.error(...args)
        if (data instanceof Error) {
          Sentry.captureException(data)
        } else {
          Sentry.captureMessage(message, "error")
        }
        break
    }
  } else {
    switch (level) {
      case "debug":
        console.debug(...args)
        break
      case "info":
        console.info(...args)
        break
      case "warn":
        console.warn(...args)
        break
      case "error":
        console.error(...args)
        break
    }
  }
}

export const logger = {
  debug: (message: string, data?: unknown) => log("debug", message, data),
  info: (message: string, data?: unknown) => log("info", message, data),
  warn: (message: string, data?: unknown) => log("warn", message, data),
  error: (message: string, data?: unknown) => log("error", message, data),
}