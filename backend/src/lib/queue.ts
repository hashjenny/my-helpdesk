import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
dotenv.config({ path: path.join(fileURLToPath(import.meta.url), "../..", ".env") })

import { PgBoss } from "pg-boss"
import { logger } from "./logger.js"

let boss: PgBoss | undefined

export function getQueue(): PgBoss {
  if (!boss) {
    boss = new PgBoss(process.env.DATABASE_URL!)
    boss.on("error", (error: Error) => {
      logger.error("pg-boss error:", error)
    })
  }
  return boss
}