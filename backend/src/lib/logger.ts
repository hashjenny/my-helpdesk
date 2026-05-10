import { isProduction } from "./env.js"
import { Sentry, isSentryEnabled } from "./sentry.js"

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
        if (isSentryEnabled && data instanceof Error) {
          Sentry.captureException(data)
        } else if (isSentryEnabled) {
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
