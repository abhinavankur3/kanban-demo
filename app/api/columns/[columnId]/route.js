import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Update a column
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { columnId } = params;
    const { name, order } = await request.json();

    // Check if column exists and belongs to user's board
    const column = await prisma.column.findUnique({
      where: {
        id: columnId,
      },
      include: {
        board: true,
      },
    });

    if (!column) {
      return NextResponse.json(
        { message: "Column not found" },
        { status: 404 }
      );
    }

    if (column.board.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Update column
    const updatedColumn = await prisma.column.update({
      where: {
        id: columnId,
      },
      data: {
        name: name !== undefined ? name : column.name,
        order: order !== undefined ? order : column.order,
      },
    });

    return NextResponse.json(updatedColumn);
  } catch (error) {
    console.error("Error updating column:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Delete a column
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { columnId } = params;

    // Check if column exists and belongs to user's board
    const column = await prisma.column.findUnique({
      where: {
        id: columnId,
      },
      include: {
        board: true,
      },
    });

    if (!column) {
      return NextResponse.json(
        { message: "Column not found" },
        { status: 404 }
      );
    }

    if (column.board.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Delete column (cascade will delete tasks)
    await prisma.column.delete({
      where: {
        id: columnId,
      },
    });

    // Reorder remaining columns
    const remainingColumns = await prisma.column.findMany({
      where: {
        boardId: column.boardId,
        order: {
          gt: column.order,
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    for (const col of remainingColumns) {
      await prisma.column.update({
        where: {
          id: col.id,
        },
        data: {
          order: col.order - 1,
        },
      });
    }

    return NextResponse.json({ message: "Column deleted successfully" });
  } catch (error) {
    console.error("Error deleting column:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
