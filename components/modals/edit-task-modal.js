"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { useBoardContext } from "@/context/board-context";

export default function EditTaskModal({
  isOpen,
  onClose,
  task,
  onTaskUpdated,
}) {
  const router = useRouter();
  const { board, setBoard } = useBoardContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setColumnId(task.columnId);
      setSubtasks(
        task.subtasks.map((st) => ({
          id: st.id,
          title: st.title,
          isCompleted: st.isCompleted,
        }))
      );
    }
  }, [task]);

  const handleAddSubtask = () => {
    setSubtasks([
      ...subtasks,
      { id: crypto.randomUUID(), title: "", isCompleted: false },
    ]);
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubtaskTitleChange = (id, value) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, title: value } : st))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    if (!columnId) {
      setError("Status column is required");
      return;
    }

    // Filter out empty subtasks
    const filteredSubtasks = subtasks.filter((st) => st.title.trim());

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          columnId,
          subtasks: filteredSubtasks,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      // Update the local board state
      setBoard((prevBoard) => {
        // If column changed, we need to move the task
        if (task.columnId !== columnId) {
          const updatedColumns = prevBoard.columns.map((col) => {
            if (col.id === task.columnId) {
              return {
                ...col,
                tasks: col.tasks.filter((t) => t.id !== task.id),
              };
            }
            if (col.id === columnId) {
              return {
                ...col,
                tasks: [...col.tasks, updatedTask],
              };
            }
            return col;
          });

          return {
            ...prevBoard,
            columns: updatedColumns,
          };
        } else {
          // Just update the task in its current column
          const updatedColumns = prevBoard.columns.map((col) => {
            if (col.id === columnId) {
              return {
                ...col,
                tasks: col.tasks.map((t) =>
                  t.id === task.id ? updatedTask : t
                ),
              };
            }
            return col;
          });

          return {
            ...prevBoard,
            columns: updatedColumns,
          };
        }
      });

      if (onTaskUpdated) {
        onTaskUpdated(updatedTask);
      }

      onClose();
      router.refresh();
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Edit Task</h2>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="task-title"
              className="mb-2 block text-sm font-medium"
            >
              Title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Add payment method"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="task-description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. The payment method needs to support credit cards and PayPal"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Subtasks</label>
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center">
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) =>
                      handleSubtaskTitleChange(subtask.id, e.target.value)
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Make coffee"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(subtask.id)}
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
            onClick={handleAddSubtask}
            className="mb-4 flex w-full items-center justify-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/80"
          >
            <Plus className="mr-1 h-4 w-4" /> Add New Subtask
          </button>

          <div className="mb-4">
            <label
              htmlFor="task-status"
              className="mb-2 block text-sm font-medium"
            >
              Status
            </label>
            <select
              id="task-status"
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {board?.columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.name}
                </option>
              ))}
            </select>
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
