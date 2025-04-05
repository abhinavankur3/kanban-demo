import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Create a new task
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { columnId } = params
    const { title, description, subtasks } = await request.json()

    if (!title) {
      return NextResponse.json({ message: "Task title is required" }, { status: 400 })
    }

    // Check if column exists and belongs to user's board
    const column = await prisma.column.findUnique({
      where: {
        id: columnId,
      },
      include: {
        board: true,
        tasks: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    if (!column) {
      return NextResponse.json({ message: "Column not found" }, { status: 404 })
    }

    if (column.board.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Create new task with order at the end
    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        order: column.tasks.length,
        columnId,
        subtasks: {
          create:
            subtasks?.map((subtask) => ({
              title: subtask.title,
              isCompleted: subtask.isCompleted || false,
            })) || [],
        },
      },
      include: {
        subtasks: true,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

