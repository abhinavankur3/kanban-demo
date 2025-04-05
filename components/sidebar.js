"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Eye, EyeOff, Plus, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import ThemeToggle from "@/components/theme-toggle"
import CreateBoardModal from "@/components/modals/create-board-modal"
import { useMobile } from "@/hooks/use-mobile"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [boards, setBoards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSidebarHidden, setIsSidebarHidden] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const isMobile = useMobile()
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut({ redirect: false })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await fetch("/api/boards")
        if (!response.ok) throw new Error("Failed to fetch boards")
        const data = await response.json()
        setBoards(data)
      } catch (error) {
        console.error("Error fetching boards:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBoards()
  }, [])

  const handleCreateBoard = (newBoard) => {
    setBoards((prev) => [...prev, newBoard])
  }

  if (isMobile) {
    return null
  }

  if (isSidebarHidden) {
    return (
      <button
        onClick={() => setIsSidebarHidden(false)}
        className="fixed bottom-8 left-0 flex h-12 w-12 items-center justify-center rounded-r-full bg-primary text-primary-foreground"
      >
        <Eye className="h-5 w-5" />
      </button>
    )
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">kanban</h1>
      </div>

      <div className="flex-1 overflow-auto px-3 py-2">
        <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          ALL BOARDS ({isLoading ? "..." : boards.length})
        </h2>
        <nav className="space-y-1">
          {isLoading ? (
            <div className="flex animate-pulse items-center px-3 py-2">
              <div className="h-4 w-full rounded bg-muted"></div>
            </div>
          ) : (
            boards.map((board) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === `/boards/${board.id}`
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  ></path>
                </svg>
                {board.name}
              </Link>
            ))
          )}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />+ Create New Board
          </button>
        </nav>
      </div>

      <div className="p-4">
        <div className="mb-4 flex justify-center rounded-md bg-background p-3">
          <ThemeToggle />
        </div>
        <button
          onClick={() => setIsSidebarHidden(true)}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground mb-2"
        >
          <EyeOff className="mr-2 h-4 w-4" />
          Hide Sidebar
        </button>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      {isCreateModalOpen && (
        <CreateBoardModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateBoard={handleCreateBoard}
        />
      )}
    </aside>
  )
}

