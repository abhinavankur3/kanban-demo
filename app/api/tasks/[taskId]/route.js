import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get a specific task
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = params;

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        subtasks: {
          orderBy: {
            id: "asc",
          },
        },
        column: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    if (task.column.board.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Update a task
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = params;
    const { title, description, columnId, order, subtasks } =
      await request.json();

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
        subtasks: true,
      },
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    if (task.column.board.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // If changing column, verify the new column belongs to the same board
    if (columnId && columnId !== task.columnId) {
      const newColumn = await prisma.column.findUnique({
        where: {
          id: columnId,
        },
        include: {
          board: true,
        },
      });

      if (!newColumn) {
        return NextResponse.json(
          { message: "Column not found" },
          { status: 404 }
        );
      }

      if (newColumn.board.userId !== session.user.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        title: title !== undefined ? title : task.title,
        description: description !== undefined ? description : task.description,
        columnId: columnId !== undefined ? columnId : task.columnId,
        order: order !== undefined ? order : task.order,
      },
      include: {
        subtasks: true,
      },
    });

    // Handle subtasks update if provided
    if (subtasks) {
      // Get existing subtask IDs
      const existingSubtaskIds = task.subtasks.map((st) => st.id);

      // Find subtasks to delete (existing but not in the update)
      const subtasksToDelete = task.subtasks.filter(
        (st) => !subtasks.some((newSt) => newSt.id === st.id)
      );

      // Delete subtasks that are no longer needed
      if (subtasksToDelete.length > 0) {
        await prisma.subtask.deleteMany({
          where: {
            id: {
              in: subtasksToDelete.map((st) => st.id),
            },
          },
        });
      }

      // Update or create subtasks
      for (const subtask of subtasks) {
        if (subtask.id && existingSubtaskIds.includes(subtask.id)) {
          // Update existing subtask
          await prisma.subtask.update({
            where: {
              id: subtask.id,
            },
            data: {
              title: subtask.title,
              isCompleted: subtask.isCompleted,
            },
          });
        } else {
          // Create new subtask
          await prisma.subtask.create({
            data: {
              title: subtask.title,
              isCompleted: subtask.isCompleted || false,
              taskId,
            },
          });
        }
      }
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Delete a task
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = params;

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
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    if (task.column.board.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Delete task (cascade will delete subtasks)
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    // Reorder remaining tasks in the column
    const remainingTasks = await prisma.task.findMany({
      where: {
        columnId: task.columnId,
        order: {
          gt: task.order,
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    for (const t of remainingTasks) {
      await prisma.task.update({
        where: {
          id: t.id,
        },
        data: {
          order: t.order - 1,
        },
      });
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
