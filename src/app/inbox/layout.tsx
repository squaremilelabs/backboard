import { Layout as AppLayout } from "./layout-components"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}
