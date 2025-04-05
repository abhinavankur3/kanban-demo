import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Create a new column
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { boardId } = params
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ message: "Column name is required" }, { status: 400 })
    }

    // Check if board exists and belongs to user
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
        },
      },
    })

    if (!board) {
      return NextResponse.json({ message: "Board not found" }, { status: 404 })
    }

    // Create new column with order at the end
    const column = await prisma.column.create({
      data: {
        name,
        order: board.columns.length,
        boardId,
      },
    })

    return NextResponse.json(column, { status: 201 })
  } catch (error) {
    console.error("Error creating column:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

