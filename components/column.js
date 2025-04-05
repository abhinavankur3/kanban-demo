"use client";

import { Draggable } from "react-beautiful-dnd";
import TaskCard from "@/components/task-card";

export default function Column({ column, provided }) {
  const { id, name, tasks = [] } = column;

  // Determine the color based on the column name
  const getColumnColor = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("todo")) return "bg-cyan-500";
    if (lowerName.includes("doing")) return "bg-purple-500";
    if (lowerName.includes("done")) return "bg-green-500";

    // Use a deterministic approach based on the column name
    // This prevents hydration errors by ensuring the same color is chosen
    // on both server and client for the same column name
    const colors = [
      "bg-orange-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-indigo-500",
    ];
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const columnColor = getColumnColor(name);
  const taskCount = tasks.length;

  return (
    <div
      className="flex-shrink-0 w-72 mr-4 h-full flex flex-col"
      ref={provided.innerRef}
      {...provided.droppableProps}
    >
      <div className="mb-6 flex items-center">
        <div className={`h-3 w-3 rounded-full ${columnColor} mr-2`}></div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {name} ({taskCount})
        </h3>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {tasks.map((task, index) => (
          <Draggable key={task.id} draggableId={task.id} index={index}>
            {(provided, snapshot) => (
              <TaskCard
                task={task}
                provided={provided}
                isDragging={snapshot.isDragging}
              />
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    </div>
  );
}
