"use client"

import { useState } from "react"

export default function AddColumnModal({ isOpen, onClose, onAddColumn }) {
  const [columnName, setColumnName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!columnName.trim()) {
      setError("Column name is required")
      return
    }

    setIsSubmitting(true)

    try {
      await onAddColumn(columnName)
      onClose()
    } catch (error) {
      console.error("Error adding column:", error)
      setError("Failed to add column. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Add New Column</h2>

        {error && <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="column-name" className="mb-2 block text-sm font-medium">
              Column Name
            </label>
            <input
              id="column-name"
              type="text"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. In Progress"
            />
          </div>

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
              {isSubmitting ? "Adding..." : "Add Column"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

