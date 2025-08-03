import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { typography } from "@/common/components/class-names"
import { cn } from "~/smui/utils"

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center px-8 pt-[10dvh]">
      <div className="flex w-400 max-w-full flex-col gap-[5dvh]">
        <div className="flex flex-wrap items-start gap-16">
          <Image src="/images/backboard-logo.svg" alt="Backboard Logo" height={80} width={80} />
          <div className="flex w-fit flex-col gap-6">
            <h1
              className={typography({
                type: "gradient-title",
                className: "text-[50px] leading-[50px]",
              })}
            >
              Backboard
            </h1>
            <h3 className="pl-2 text-lg">
              <span className="text-neutral-text font-semibold">Inbox Zero</span>{" "}
              <span className="text-primary-text font-medium">for your tasks</span>
            </h3>
          </div>
        </div>
        <SignedOut>
          <div className="flex flex-col gap-8">
            <SignInButton>
              <button
                className={cn([
                  "flex items-center justify-center rounded-sm border-2 p-16",
                  "bg-primary-bg text-primary-fg border-primary-border",
                  "text-lg font-semibold",
                  "cursor-pointer hover:opacity-70",
                ])}
              >
                Sign in
              </button>
            </SignInButton>
            <p className="text-neutral-text text-center">
              or{" "}
              <Link
                href="https://accounts.backboard.work/waitlist"
                target="_blank"
                className="cursor-pointer underline hover:opacity-70"
              >
                Request an account
              </Link>
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
            <div className="flex flex-col gap-8">
              <p className="text-lg font-semibold">Thanks for joining the beta!</p>
              <p className="text-neutral-text">Your feedback would be greatly appreciated.</p>
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
