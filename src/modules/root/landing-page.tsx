"use client"
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { EllipsisVerticalIcon } from "lucide-react"
import LoomPlayer from "react-loom-player"
import { FEEDBACK_URL, ROADMAP_URL } from "./app-layout/links"
import { typography } from "@/common/components/class-names"
import { cn } from "~/smui/utils"

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center px-8 pt-[10dvh]">
      <div className="flex w-400 max-w-full flex-col gap-[5dvh]">
        <div className="flex flex-col gap-16">
          <div className="flex flex-wrap items-start gap-16">
            <div className="flex w-fit flex-col gap-6">
              <h1
                className={typography({
                  type: "backboard-type",
                  className: "text-[60px] leading-[60px]",
                })}
              >
                Backboard
              </h1>
            </div>
            <p className="font-semibold">A to-do list with inbox zero energy.</p>
          </div>
        </div>
        <SignedOut>
          <div className="flex flex-col gap-16">
            <LoomPlayer
              src="https://www.loom.com/share/a43335c576af4c5f9d9e707f63188660"
              style={{
                height: "250px",
                width: "400px",
                border: "2px solid var(--color-base-border)",
                boxSizing: "border-box",
                padding: "2px",
                borderRadius: "2px",
              }}
            />
            <SignUpButton>
              <button
                className={cn([
                  "flex items-center justify-center rounded-sm border-2 p-16",
                  "bg-primary-bg text-primary-fg border-primary-border",
                  "text-lg font-semibold",
                  "cursor-pointer hover:opacity-70",
                ])}
              >
                Sign up (it&apos;s free!)
              </button>
            </SignUpButton>
            <p className="text-neutral-text text-center">
              or{" "}
              <SignInButton>
                <a className="cursor-pointer underline hover:opacity-70">Sign in</a>
              </SignInButton>
            </p>
          </div>
        </SignedOut>
        <SignedIn>
          <div className={cn("flex items-start gap-8 rounded-sm border p-16", "max-w-full")}>
            <Image
              src="/images/e-headshot.png"
              alt="E"
              height={24}
              width={24}
              className="rounded-full"
            />
            <div className="flex flex-col gap-16">
              <p className="text-lg font-semibold">Thanks for joining the beta!</p>
              <p className="text-neutral-text">
                Click on the <EllipsisVerticalIcon className="inline-block size-14" /> icon on the
                top right corner to view the{" "}
                <Link href={ROADMAP_URL} target="_blank" className="underline">
                  Product Roadmap
                </Link>{" "}
                or to{" "}
                <Link href={FEEDBACK_URL} target="_blank" className="underline">
                  Submit Feedback
                </Link>
                .
              </p>
              <p className="text-neutral-text">Your feedback would be greatly appreciated!</p>
              <p className="flex items-center gap-8">
                <span className="font-medium">🙏 E</span>
                <span className="text-neutral-text text-sm">e@squaremilelabs.com</span>
              </p>
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  )
}
