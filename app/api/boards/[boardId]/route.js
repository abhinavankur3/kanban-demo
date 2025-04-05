import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Get a specific board
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { boardId } = params

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
                subtasks: {
                  orderBy: {
                    id: "asc",
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!board) {
      return NextResponse.json({ message: "Board not found" }, { status: 404 })
    }

    return NextResponse.json(board)
  } catch (error) {
    console.error("Error fetching board:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Update a board
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { boardId } = params
    const { name, columns } = await request.json()

    if (!name) {
      return NextResponse.json({ message: "Board name is required" }, { status: 400 })
    }

    // Check if board exists and belongs to user
    const existingBoard = await prisma.board.findUnique({
      where: {
        id: boardId,
        userId: session.user.id,
      },
      include: {
        columns: true,
      },
    })

    if (!existingBoard) {
      return NextResponse.json({ message: "Board not found" }, { status: 404 })
    }

    // Update board name
    const updatedBoard = await prisma.board.update({
      where: {
        id: boardId,
      },
      data: {
        name,
      },
    })

    // Handle columns update if provided
    if (columns) {
      // Get existing column IDs
      const existingColumnIds = existingBoard.columns.map((col) => col.id)

      // Find columns to delete (existing but not in the update)
      const columnsToDelete = existingBoard.columns.filter((col) => !columns.some((newCol) => newCol.id === col.id))

      // Delete columns that are no longer needed
      if (columnsToDelete.length > 0) {
        await prisma.column.deleteMany({
          where: {
            id: {
              in: columnsToDelete.map((col) => col.id),
            },
          },
        })
      }

      // Update or create columns
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i]

        if (column.id && existingColumnIds.includes(column.id)) {
          // Update existing column
          await prisma.column.update({
            where: {
              id: column.id,
            },
            data: {
              name: column.name,
              order: i,
            },
          })
        } else {
          // Create new column
          await prisma.column.create({
            data: {
              name: column.name,
              order: i,
              boardId,
            },
          })
        }
      }
    }

    return NextResponse.json(updatedBoard)
  } catch (error) {
    console.error("Error updating board:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Delete a board
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { boardId } = params

    // Check if board exists and belongs to user
    const board = await prisma.board.findUnique({
      where: {
        id: boardId,
        userId: session.user.id,
      },
    })

    if (!board) {
      return NextResponse.json({ message: "Board not found" }, { status: 404 })
    }

    // Delete board (cascade will delete columns and tasks)
    await prisma.board.delete({
      where: {
        id: boardId,
      },
    })

    return NextResponse.json({ message: "Board deleted successfully" })
  } catch (error) {
    console.error("Error deleting board:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

