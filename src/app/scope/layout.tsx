import { Layout as AppLayout } from "./[id]/_components/layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}
