"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Plus } from "lucide-react";
import Column from "@/components/column";
import { BoardProvider } from "@/context/board-context";
import AddColumnModal from "@/components/modals/add-column-modal";

export default function Board({ board: initialBoard }) {
  const [board, setBoard] = useState(initialBoard);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);

  useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Create a new board state with the updated task positions
    const newBoard = { ...board };

    // Find the source and destination columns
    const sourceColumn = newBoard.columns.find(
      (col) => col.id === source.droppableId
    );
    const destinationColumn = newBoard.columns.find(
      (col) => col.id === destination.droppableId
    );

    // Find the task that was dragged
    const draggedTask = sourceColumn.tasks.find(
      (task) => task.id === draggableId
    );

    // Remove the task from the source column
    sourceColumn.tasks = sourceColumn.tasks.filter(
      (task) => task.id !== draggableId
    );

    // Add the task to the destination column
    destinationColumn.tasks.splice(destination.index, 0, draggedTask);

    // Update the task's column ID if it changed columns
    if (sourceColumn.id !== destinationColumn.id) {
      draggedTask.columnId = destinationColumn.id;
    }

    // Update the order of tasks in both columns
    sourceColumn.tasks.forEach((task, index) => {
      task.order = index;
    });

    destinationColumn.tasks.forEach((task, index) => {
      task.order = index;
    });

    // Update the local state
    setBoard(newBoard);

    // Send the update to the server
    try {
      await fetch("/api/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: draggableId,
          sourceColumnId: source.droppableId,
          destinationColumnId: destination.droppableId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
        }),
      });
    } catch (error) {
      console.error("Error reordering task:", error);
      // Revert to the initial state if there's an error
      setBoard(initialBoard);
    }
  };

  const handleAddColumn = async (columnName) => {
    try {
      const response = await fetch(`/api/boards/${board.id}/columns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: columnName }),
      });

      if (!response.ok) throw new Error("Failed to add column");

      const newColumn = await response.json();

      setBoard((prev) => ({
        ...prev,
        columns: [...prev.columns, { ...newColumn, tasks: [] }],
      }));
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };

  if (!board) {
    return (
      <div className="flex h-full items-center justify-center">Loading...</div>
    );
  }

  return (
    <BoardProvider board={board} setBoard={setBoard}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex h-full overflow-x-auto p-4">
          {board.columns.map((column) => (
            <Droppable
              direction="vertical"
              isDropDisabled={false}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
              key={column.id}
              droppableId={column.id}
            >
              {(provided) => <Column column={column} provided={provided} />}
            </Droppable>
          ))}

          <div className="flex-shrink-0 w-72 h-full rounded-md bg-background/50 flex items-center justify-center">
            <button
              onClick={() => setIsAddColumnModalOpen(true)}
              className="text-lg font-medium text-muted-foreground hover:text-foreground flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Column
            </button>
          </div>
        </div>
      </DragDropContext>

      {isAddColumnModalOpen && (
        <AddColumnModal
          isOpen={isAddColumnModalOpen}
          onClose={() => setIsAddColumnModalOpen(false)}
          onAddColumn={handleAddColumn}
        />
      )}
    </BoardProvider>
  );
}
