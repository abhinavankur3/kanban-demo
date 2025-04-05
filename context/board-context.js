"use client";

import { createContext, useContext } from "react";

const BoardContext = createContext(null);

export function BoardProvider({ children, board, setBoard }) {
  return (
    <BoardContext.Provider value={{ board, setBoard }}>
      {children}
    </BoardContext.Provider>
  );
}

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoardContext must be used within a BoardProvider");
  }
  return context;
};
