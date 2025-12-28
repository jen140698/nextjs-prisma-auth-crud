import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Session } from "inspector/promises";

// GET single post
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(params.id) },
      include: {
        author: {
          select: { id: true, email: true },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// UPDATE post (ADMIN only)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {

  try {
    const session = await getServerSession(authOptions);


    const { title, content, authorId } = await req.json();

    const post = await prisma.post.findUnique({
      where: { id: Number(params.id) },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    /**
     * TEMPORARY: replace with session user
     */
    const adminUserId = authorId;

    const user = await prisma.user.findUnique({
      where: { id: adminUserId },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: { title, content },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE post (ADMIN only)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
  const session = await getServerSession(authOptions);
  const { id } = await context.params; // ✅ await params

    const adminUserId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: adminUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    await prisma.post.delete({
    where: { id: Number(id) },
  });


    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
