import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EmptyBoard from "@/components/empty-board"

export default async function BoardsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const boards = await prisma.board.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  if (boards.length === 0) {
    return <EmptyBoard />
  }

  // Redirect to the first board
  redirect(`/boards/${boards[0].id}`)
}

