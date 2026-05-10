import dotenv from "dotenv"
import { existsSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const currentDir = path.dirname(fileURLToPath(import.meta.url))

const candidateEnvFiles = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "..", ".env"),
  path.resolve(currentDir, "..", "..", "..", ".env"),
  path.resolve(currentDir, "..", "..", ".env"),
]

const envPath = candidateEnvFiles.find((candidate) => existsSync(candidate))

if (envPath) {
  dotenv.config({ path: envPath })
}

export const isProduction = process.env.NODE_ENV === "production"
