"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateBoardModal({ isOpen, onClose, onCreateBoard }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [columns, setColumns] = useState([
    { id: crypto.randomUUID(), name: "TODO" },
    { id: crypto.randomUUID(), name: "DOING" },
    { id: crypto.randomUUID(), name: "DONE" },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleAddColumn = () => {
    setColumns([...columns, { id: crypto.randomUUID(), name: "" }])
  }

  const handleRemoveColumn = (id) => {
    setColumns(columns.filter((col) => col.id !== id))
  }

  const handleColumnNameChange = (id, value) => {
    setColumns(columns.map((col) => (col.id === id ? { ...col, name: value } : col)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Board name is required")
      return
    }

    // Validate column names
    const emptyColumns = columns.filter((col) => !col.name.trim())
    if (emptyColumns.length > 0) {
      setError("All columns must have a name")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          columns,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create board")
      }

      const newBoard = await response.json()

      if (onCreateBoard) {
        onCreateBoard(newBoard)
      }

      onClose()
      router.push(`/boards/${newBoard.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error creating board:", error)
      setError("Failed to create board. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Add New Board</h2>

        {error && <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="board-name" className="mb-2 block text-sm font-medium">
              Board Name
            </label>
            <input
              id="board-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Web Design"
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Board Columns</label>
            <div className="space-y-2">
              {columns.map((column) => (
                <div key={column.id} className="flex items-center">
                  <input
                    type="text"
                    value={column.name}
                    onChange={(e) => handleColumnNameChange(column.id, e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. TODO"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveColumn(column.id)}
                    className="ml-2 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddColumn}
            className="mb-4 flex w-full items-center justify-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/80"
          >
            <Plus className="mr-1 h-4 w-4" /> Add New Column
          </button>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Board"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

