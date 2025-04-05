import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Reorder tasks within or between columns
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex } = await request.json()

    // Validate input
    if (
      !taskId ||
      !sourceColumnId ||
      !destinationColumnId ||
      sourceIndex === undefined ||
      destinationIndex === undefined
    ) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if task exists and belongs to user's board
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        column: {
          include: {
            board: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    if (task.column.board.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if source and destination columns exist and belong to the same board
    const sourceColumn = await prisma.column.findUnique({
      where: {
        id: sourceColumnId,
      },
      include: {
        board: true,
      },
    })

    const destinationColumn = await prisma.column.findUnique({
      where: {
        id: destinationColumnId,
      },
      include: {
        board: true,
      },
    })

    if (!sourceColumn || !destinationColumn) {
      return NextResponse.json({ message: "Column not found" }, { status: 404 })
    }

    if (sourceColumn.board.id !== destinationColumn.board.id) {
      return NextResponse.json({ message: "Columns must belong to the same board" }, { status: 400 })
    }

    if (sourceColumn.board.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Start a transaction for reordering
    await prisma.$transaction(async (tx) => {
      // Same column reordering
      if (sourceColumnId === destinationColumnId) {
        // Get all tasks in the column
        const tasks = await tx.task.findMany({
          where: {
            columnId: sourceColumnId,
          },
          orderBy: {
            order: "asc",
          },
        })

        // Remove the task from its current position
        const newTasks = [...tasks]
        const [movedTask] = newTasks.splice(sourceIndex, 1)

        // Insert the task at the new position
        newTasks.splice(destinationIndex, 0, movedTask)

        // Update the order of all tasks
        for (let i = 0; i < newTasks.length; i++) {
          await tx.task.update({
            where: {
              id: newTasks[i].id,
            },
            data: {
              order: i,
            },
          })
        }
      } else {
        // Moving between columns

        // Update the task's column and set it to the end
        await tx.task.update({
          where: {
            id: taskId,
          },
          data: {
            columnId: destinationColumnId,
          },
        })

        // Get all tasks in source column
        const sourceTasks = await tx.task.findMany({
          where: {
            columnId: sourceColumnId,
          },
          orderBy: {
            order: "asc",
          },
        })

        // Reorder source column tasks
        for (let i = 0; i < sourceTasks.length; i++) {
          if (i >= sourceIndex) {
            await tx.task.update({
              where: {
                id: sourceTasks[i].id,
              },
              data: {
                order: i > sourceIndex ? i - 1 : i,
              },
            })
          }
        }

        // Get all tasks in destination column
        const destTasks = await tx.task.findMany({
          where: {
            columnId: destinationColumnId,
            id: {
              not: taskId,
            },
          },
          orderBy: {
            order: "asc",
          },
        })

        // Insert the task at the destination position
        for (let i = 0; i < destTasks.length; i++) {
          if (i >= destinationIndex) {
            await tx.task.update({
              where: {
                id: destTasks[i].id,
              },
              data: {
                order: i + 1,
              },
            })
          }
        }

        // Set the moved task's order
        await tx.task.update({
          where: {
            id: taskId,
          },
          data: {
            order: destinationIndex,
          },
        })
      }
    })

    return NextResponse.json({ message: "Task reordered successfully" })
  } catch (error) {
    console.error("Error reordering task:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

