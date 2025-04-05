import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import BoardProviderWrapper from "@/components/board-provider-wrapper"

export default async function BoardsLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <BoardProviderWrapper>
          <Header />
          <main className="flex-1 overflow-auto p-0">{children}</main>
        </BoardProviderWrapper>
      </div>
    </div>
  )
}

