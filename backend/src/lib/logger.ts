import * as Sentry from "@sentry/node"

const DSN = "https://68033a0e75cd239735c2814c55beaacd@o4511357945053184.ingest.us.sentry.io/4511358000037888"
const isProduction = process.env.NODE_ENV === "production"

if (isProduction) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 1.0,
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