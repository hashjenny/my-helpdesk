import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
dotenv.config({ path: path.join(fileURLToPath(import.meta.url), "../..", ".env") })
import { PrismaClient } from "@prisma/client"

export const prisma = new PrismaClient()