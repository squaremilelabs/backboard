import { currentUser } from "@clerk/nextjs/server"
import { enhance } from "@zenstackhq/runtime"
import { NextRequestHandler } from "@zenstackhq/server/next"
import prisma from "@/database/prisma"

const getPrisma = async () => {
  const user = await currentUser()
  return enhance(prisma, {
    user: user ? { id: user.id } : undefined,
  })
}

const handler = NextRequestHandler({ getPrisma, useAppDir: true })

export { handler as DELETE, handler as GET, handler as PATCH, handler as POST, handler as PUT }
