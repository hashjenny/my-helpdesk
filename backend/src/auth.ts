import "./lib/env.js"

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, APIError } from "better-auth/api";
import bcrypt from "bcrypt";
import { prisma } from "./lib/prisma.js";

const trustedOriginsFromEnv = process.env.TRUSTED_ORIGINS
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean) ?? [];
const defaultTrustedOrigins = process.env.NODE_ENV === "production"
  ? []
  : ["http://localhost:5173"];

const trustedOrigins = trustedOriginsFromEnv.length > 0
  ? trustedOriginsFromEnv.includes("localhost")
    ? [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
      ]
    : trustedOriginsFromEnv
  : defaultTrustedOrigins;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    disableSignUp: false,
    password: {
      hash: async (password) => bcrypt.hash(password, 10),
      verify: async ({ hash, password }) => bcrypt.compare(password, hash),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "AGENT",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      delete: {
        after: async (user) => {
          await prisma.session.deleteMany({
            where: { userId: user.id },
          });
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (!ctx.path?.endsWith("/sign-in/email")) {
        return;
      }
      const email = ctx.body?.email as string | undefined;
      if (!email) {
        return;
      }
      const user = await prisma.user.findUnique({
        where: { email },
        select: { deletedAt: true },
      });
      if (user?.deletedAt) {
        throw new APIError("BAD_REQUEST", {
          message: "This account has been deleted",
        });
      }
    }),
  },
  trustedOrigins,
});
