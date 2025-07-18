// https://www.prisma.io/docs/guides/prisma-orm-with-nextjs#25-set-up-prisma-client

import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
const globalForPrisma = global as unknown as { prisma: typeof prisma }
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
export default prisma
