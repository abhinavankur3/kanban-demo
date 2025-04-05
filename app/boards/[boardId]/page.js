import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Board from "@/components/board";

export default async function BoardPage({ params: paramsPromise }) {
  // Await the params object to properly access its properties
  const params = await paramsPromise;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { boardId } = await params;

  const board = await prisma.board.findUnique({
    where: {
      id: boardId,
      userId: session.user.id,
    },
    include: {
      columns: {
        orderBy: {
          order: "asc",
        },
        include: {
          tasks: {
            orderBy: {
              order: "asc",
            },
            include: {
              subtasks: true,
            },
          },
        },
      },
    },
  });

  if (!board) {
    notFound();
  }

  return (
    <div className="h-full">
      <Board board={board} />
    </div>
  );
}
