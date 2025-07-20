/* eslint-disable no-console */

import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error("Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env")
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error: Could not verify webhook:", err)
    return new Response("Error: Verification error", {
      status: 400,
    })
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data
  const eventType = evt.type
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
  console.log("Webhook payload:", body)

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      // console.log("Processing user event")
      // const user = evt.data
      // await prisma.user.upsert({
      //   where: {
      //     id: user.id,
      //   },
      //   update: {
      //     clerk_data: JSON.parse(JSON.stringify(user)),
      //   },
      //   create: {
      //     id: user.id,
      //     clerk_data: JSON.parse(JSON.stringify(user)),
      //   },
      // })
      // console.log(`User ${user.id} upserted into database`)
    }
  } catch (error) {
    console.error("Error: Could not process webhook:", error)
    return new Response("Error: Processing error", {
      status: 500,
    })
  }

  return new Response("Webhook received", { status: 200 })
}
