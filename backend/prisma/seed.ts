import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { Role } from "../src/types/role"

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables")
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingUser) {
    // Update existing user's role to ADMIN
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: Role.ADMIN },
    })
    console.log(`Admin user role updated: ${adminEmail}`)
  } else {
    // Create new admin user
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        role: Role.ADMIN,
      },
    })
    console.log(`Admin user created: ${adminEmail}`)
  }

  // Get the user
  const user = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!user) {
    console.error(`User not found: ${adminEmail}`)
    process.exit(1)
  }

  // Create or update account with password
  // Note: better-auth expects accountId to be user.id for credential provider
  const existingAccount = await prisma.account.findFirst({
    where: {
      providerId: "credential",
      accountId: user.id,
    },
  })

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { password: hashedPassword },
    })
    console.log(`Account password updated for: ${adminEmail}`)
  } else {
    await prisma.account.create({
      data: {
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: hashedPassword,
      },
    })
    console.log(`Account created for: ${adminEmail}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })