"use client"

export default function DeleteTaskModal({ isOpen, onClose, onDelete, taskTitle }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-destructive">Delete this task?</h2>
        <p className="mb-6 text-muted-foreground">
          Are you sure you want to delete the &quot;{taskTitle}&quot; task and its subtasks? This action cannot be
          reversed.
        </p>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

