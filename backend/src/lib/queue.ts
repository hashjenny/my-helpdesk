import PgBoss from "pg-boss"

let boss: PgBoss | undefined

export function getQueue(): PgBoss {
  if (!boss) {
    boss = new PgBoss(process.env.DATABASE_URL!)
    boss.on("error", (error) => {
      console.error("pg-boss error:", error)
    })
  }
  return boss
}