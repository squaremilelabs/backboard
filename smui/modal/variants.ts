import { ClassValue, tv, VariantProps } from "../utils"

// # Variants -------------------------------------------------------------------------------------

export type ModalVariantProps = VariantProps<typeof modalVariants>
export const modalVariants = tv({
  slots: {
    // <ModalOverlay />
    overlay: [],
    // <Modal />
    modal: [""],
    // <Dialog />
    content: [],
  },
  variants: {
    variant: {
      default: {
        overlay: [
          "fixed inset-0 h-dvh w-dvw z-60",
          "flex flex-col items-center p-8 md:pt-[10dvh]",
          "bg-neutral-muted-bg/30 backdrop-blur-xs",
          "overscroll-contain",
        ],
        content: ["flex flex-col max-w-[95dvw] max-h-[95dvh] overflow-auto"],
      },
      drawer: {
        overlay: [
          "fixed inset-0 h-dvh w-dvw z-60",
          "bg-neutral-muted-bg/30 backdrop-blur-xs",
          "overscroll-contain",
        ],
        content: [
          "fixed top-0 h-dvh overflow-y-auto overflow-x-hidden !outline-0",
          "overscroll-contain",
        ],
        modal: ["!outline-0"],
      },
    },
    drawerPosition: {
      left: { content: ["left-0 border-r"] },
      right: { content: ["!right-0 !border-l"] },
    },
    size: {
      xs: { content: ["w-xs"] },
      sm: { content: ["w-sm"] },
      md: { content: ["w-md"] },
      lg: { content: ["w-lg"] },
      xl: { content: ["w-xl"] },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "sm",
  },
})

export type ModalClassNames = {
  // slots.overlay
  overlay: ClassValue
  // slots.modal
  modal: ClassValue
  // slots.dialog
  content: ClassValue
}
