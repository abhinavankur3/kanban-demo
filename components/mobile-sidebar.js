"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import CreateBoardModal from "@/components/modals/create-board-modal";
import { signOut } from "next-auth/react";

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await fetch("/api/boards");
        if (!response.ok) throw new Error("Failed to fetch boards");
        const data = await response.json();
        setBoards(data);
      } catch (error) {
        console.error("Error fetching boards:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchBoards();
    }
  }, [isOpen]);

  const handleCreateBoard = (newBoard) => {
    setBoards((prev) => [...prev, newBoard]);
    setIsOpen(false);
    router.push(`/boards/${newBoard.id}`);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mr-4 rounded-md p-2 hover:bg-accent"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 backdrop-blur-sm">
          <div className="mt-16 w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                All Boards ({boards.length})
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-accent"
              >
                &times;
              </button>
            </div>

            <nav className="mb-6 space-y-1">
              {isLoading ? (
                <div className="flex animate-pulse items-center px-3 py-2">
                  <div className="h-4 w-full rounded bg-muted"></div>
                </div>
              ) : (
                boards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/boards/${board.id}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                      pathname === `/boards/${board.id}`
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                      ></path>
                    </svg>
                    {board.name}
                  </Link>
                ))
              )}

              <button
                onClick={() => {
                  setIsCreateModalOpen(true);
                }}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                + Create New Board
              </button>
            </nav>

            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
              <div className="flex justify-center rounded-md bg-background p-3">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <CreateBoardModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateBoard={handleCreateBoard}
        />
      )}
    </>
  );
}
