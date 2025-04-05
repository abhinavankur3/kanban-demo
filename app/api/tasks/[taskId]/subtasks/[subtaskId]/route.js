import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Update a subtask
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { taskId, subtaskId } = params;
    const { title, isCompleted } = await request.json();

    // Check if subtask exists and belongs to user's task
    const subtask = await prisma.subtask.findUnique({
      where: {
        id: subtaskId,
        taskId,
      },
      include: {
        task: {
          include: {
            column: {
              include: {
                board: true,
              },
            },
          },
        },
      },
    });

    if (!subtask) {
      return NextResponse.json(
        { message: "Subtask not found" },
        { status: 404 }
      );
    }

    if (subtask.task.column.board.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Update subtask
    const updatedSubtask = await prisma.subtask.update({
      where: {
        id: subtaskId,
      },
      data: {
        title: title !== undefined ? title : subtask.title,
        isCompleted:
          isCompleted !== undefined ? isCompleted : subtask.isCompleted,
      },
    });

    return NextResponse.json(updatedSubtask);
  } catch (error) {
    console.error("Error updating subtask:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
