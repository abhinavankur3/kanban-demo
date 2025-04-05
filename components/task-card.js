"use client";

import { useState, useEffect } from "react";
import TaskDetailModal from "@/components/modals/task-detail-modal";

export default function TaskCard({ task, provided, isDragging }) {
  // Initialize state with false to avoid hydration mismatch
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only run on client-side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const { title, subtasks = [] } = task;
  const completedSubtasks = subtasks.filter(
    (subtask) => subtask.isCompleted
  ).length;

  // Compute class names outside of JSX to avoid hydration mismatches
  const cardClasses = [
    "rounded-lg",
    "bg-card",
    "border",
    "border-border",
    "p-4",
    "shadow-sm",
    "cursor-pointer",
    "hover:shadow-md",
    "transition-shadow",
  ];

  if (isDragging) {
    cardClasses.push("shadow-lg");
  }

  return (
    <>
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={cardClasses.join(" ")}
        onClick={() => setIsDetailModalOpen(true)}
      >
        <h4 className="font-medium text-foreground">{title}</h4>
        {subtasks.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {completedSubtasks} of {subtasks.length} subtasks
          </p>
        )}
      </div>

      {mounted && isDetailModalOpen && (
        <TaskDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          task={task}
        />
      )}
    </>
  );
}
