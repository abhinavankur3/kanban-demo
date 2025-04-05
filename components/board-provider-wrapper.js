"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BoardProvider } from "@/context/board-context";

export default function BoardProviderWrapper({ children }) {
  // Initialize with null values to prevent hydration mismatch
  const [boardId, setBoardId] = useState(null);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const params = useParams();
  // Only access useParams on the client side to avoid hydration mismatch
  useEffect(() => {
    setBoardId(params?.boardId || null);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !boardId) {
      setBoard(null);
      setLoading(false);
      return;
    }

    const fetchBoard = async () => {
      try {
        const response = await fetch(`/api/boards/${boardId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch board");
        }
        const data = await response.json();
        setBoard(data);
      } catch (error) {
        console.error("Error fetching board:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId, mounted]);

  // Provide a consistent initial render to avoid hydration mismatches
  // Only start differentiating the rendering after client-side hydration
  if (!mounted || !boardId || loading) {
    return (
      <BoardProvider board={null} setBoard={() => {}}>
        {children}
      </BoardProvider>
    );
  }

  return (
    <BoardProvider board={board} setBoard={setBoard}>
      {children}
    </BoardProvider>
  );
}
