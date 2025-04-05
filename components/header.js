"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MoreVertical, Plus } from "lucide-react"
import { useBoardContext } from "@/context/board-context"
import CreateTaskModal from "@/components/modals/create-task-modal"
import EditBoardModal from "@/components/modals/edit-board-modal"
import DeleteBoardModal from "@/components/modals/delete-board-modal"
import MobileSidebar from "@/components/mobile-sidebar"
import { useMobile } from "@/hooks/use-mobile"

export default function Header() {
  // Get params and context
  const params = useParams()
  const router = useRouter()
  const { board } = useBoardContext()
  
  // Initialize state with consistent values to avoid hydration mismatch
  const [boardId, setBoardId] = useState(null)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [isEditBoardModalOpen, setIsEditBoardModalOpen] = useState(false)
  const [isDeleteBoardModalOpen, setIsDeleteBoardModalOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isMobile = useMobile()
  
  // Set boardId after component mounts to avoid hydration mismatch
  useEffect(() => {
    setBoardId(params?.boardId || null)
    setMounted(true)
  }, [params])

  const handleDeleteBoard = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete board")

      router.push("/boards")
      router.refresh()
    } catch (error) {
      console.error("Error deleting board:", error)
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center">
        {isMobile && <MobileSidebar />}
        <h1 className="text-xl font-bold">{board?.name || "Loading..."}</h1>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          disabled={!board || board.columns.length === 0}
          className="flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="mr-1 h-4 w-4" /> Add New Task
        </button>

        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-full p-2 hover:bg-accent">
            <MoreVertical className="h-5 w-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-card shadow-lg">
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsEditBoardModalOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-accent"
                >
                  Edit Board
                </button>
                <button
                  onClick={() => {
                    setIsDeleteBoardModalOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-destructive hover:bg-accent"
                >
                  Delete Board
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {mounted && isCreateTaskModalOpen && (
        <CreateTaskModal isOpen={isCreateTaskModalOpen} onClose={() => setIsCreateTaskModalOpen(false)} />
      )}

      {mounted && isEditBoardModalOpen && (
        <EditBoardModal isOpen={isEditBoardModalOpen} onClose={() => setIsEditBoardModalOpen(false)} board={board} />
      )}

      {mounted && isDeleteBoardModalOpen && (
        <DeleteBoardModal
          isOpen={isDeleteBoardModalOpen}
          onClose={() => setIsDeleteBoardModalOpen(false)}
          onDelete={handleDeleteBoard}
          boardName={board?.name}
        />
      )}
    </header>
  )
}

