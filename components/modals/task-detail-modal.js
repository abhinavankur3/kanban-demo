"use client";

import { useState, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { useBoardContext } from "@/context/board-context";
import EditTaskModal from "@/components/modals/edit-task-modal";
import DeleteTaskModal from "@/components/modals/delete-task-modal";

export default function TaskDetailModal({ isOpen, onClose, task }) {
  const { board, setBoard } = useBoardContext();

  const [currentTask, setCurrentTask] = useState(task);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(task.columnId);

  useEffect(() => {
    setCurrentTask(task);
    setSelectedColumnId(task.columnId);
  }, [task]);

  const handleSubtaskToggle = async (subtaskId, isCompleted) => {
    try {
      const response = await fetch(
        `/api/tasks/${task.id}/subtasks/${subtaskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isCompleted,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update subtask");

      // Update local state
      setCurrentTask((prev) => ({
        ...prev,
        subtasks: prev.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, isCompleted } : st
        ),
      }));

      // Update board context
      setBoard((prevBoard) => {
        const updatedColumns = prevBoard.columns.map((col) => {
          if (col.id === task.columnId) {
            return {
              ...col,
              tasks: col.tasks.map((t) => {
                if (t.id === task.id) {
                  return {
                    ...t,
                    subtasks: t.subtasks.map((st) =>
                      st.id === subtaskId ? { ...st, isCompleted } : st
                    ),
                  };
                }
                return t;
              }),
            };
          }
          return col;
        });

        return {
          ...prevBoard,
          columns: updatedColumns,
        };
      });
    } catch (error) {
      console.error("Error updating subtask:", error);
    }
  };

  const handleStatusChange = async (e) => {
    const newColumnId = e.target.value;
    setSelectedColumnId(newColumnId);

    if (newColumnId === task.columnId) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          columnId: newColumnId,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task status");

      // Update board context
      setBoard((prevBoard) => {
        const sourceColumn = prevBoard.columns.find(
          (col) => col.id === task.columnId
        );
        const destColumn = prevBoard.columns.find(
          (col) => col.id === newColumnId
        );

        if (!sourceColumn || !destColumn) return prevBoard;

        const updatedTask = { ...task, columnId: newColumnId };

        const updatedColumns = prevBoard.columns.map((col) => {
          if (col.id === task.columnId) {
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== task.id),
            };
          }
          if (col.id === newColumnId) {
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
      });

      // Update local state
      setCurrentTask((prev) => ({
        ...prev,
        columnId: newColumnId,
      }));

      // Close the modal after changing status
      onClose();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");

      // Update board context
      setBoard((prevBoard) => {
        const updatedColumns = prevBoard.columns.map((col) => {
          if (col.id === task.columnId) {
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== task.id),
            };
          }
          return col;
        });

        return {
          ...prevBoard,
          columns: updatedColumns,
        };
      });

      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  if (!isOpen) return null;

  const completedSubtasks = currentTask.subtasks.filter(
    (st) => st.isCompleted
  ).length;
  const totalSubtasks = currentTask.subtasks.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{currentTask.title}</h2>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-full p-2 hover:bg-accent"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-card shadow-lg">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsEditModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-accent"
                  >
                    Edit Task
                  </button>
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-destructive hover:bg-accent"
                  >
                    Delete Task
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {currentTask.description && (
          <p className="mb-6 text-sm text-muted-foreground">
            {currentTask.description}
          </p>
        )}

        {totalSubtasks > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium">
              Subtasks ({completedSubtasks} of {totalSubtasks})
            </h3>
            <div className="space-y-2">
              {currentTask.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center rounded-md bg-background p-3"
                >
                  <input
                    type="checkbox"
                    id={`subtask-${subtask.id}`}
                    checked={subtask.isCompleted}
                    onChange={(e) =>
                      handleSubtaskToggle(subtask.id, e.target.checked)
                    }
                    className="mr-3 h-4 w-4 rounded border-input"
                  />
                  <label
                    htmlFor={`subtask-${subtask.id}`}
                    className={`text-sm ${
                      subtask.isCompleted
                        ? "text-muted-foreground line-through"
                        : ""
                    }`}
                  >
                    {subtask.title}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium">Status</h3>
          <select
            value={selectedColumnId}
            onChange={handleStatusChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {board?.columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Close
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          task={currentTask}
          onTaskUpdated={(updatedTask) => {
            setCurrentTask(updatedTask);
            setIsEditModalOpen(false);
          }}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteTaskModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteTask}
          taskTitle={currentTask.title}
        />
      )}
    </div>
  );
}
