"use client";

import { useState } from "react";
import CreateBoardModal from "@/components/modals/create-board-modal";

export default function EmptyBoard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="mb-2 text-xl font-bold">
          Create a new board to get started
        </h2>
        <p className="mb-6 text-muted-foreground">
          You don&apos;t have any boards yet. Create your first board to start
          organizing your tasks.
        </p>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Create New Board
        </button>
      </div>

      {isCreateModalOpen && (
        <CreateBoardModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateBoard={() => window.location.reload()}
        />
      )}
    </div>
  );
}
