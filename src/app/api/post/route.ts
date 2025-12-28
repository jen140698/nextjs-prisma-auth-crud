import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // 🔓 Public user (not logged in) → show all posts
    if (!session || !session.user) {
      const posts = await prisma.post.findMany({
        include: {
          author: {
            select: { id: true, email: true },
          },
        },
      })

      return NextResponse.json(posts)
    }

    // 🧑 USER → see all posts
    if (session.user.role === "USER") {
      const posts = await prisma.post.findMany({
        include: {
          author: {
            select: { id: true, email: true },
          },
        },
      })

      return NextResponse.json(posts)
    }

    // 👑 ADMIN → see ONLY own posts
    if (session.user.role === "ADMIN") {
      const posts = await prisma.post.findMany({
        where: {
          authorId: session.user.id,
        },
        include: {
          author: {
            select: { id: true, email: true },
          },
        },
      })

      return NextResponse.json(posts)
    }

    return NextResponse.json([], { status: 200 })
  } catch (error) {
    console.error("GET /post error:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}


// CREATE post (ADMIN only - auth to be added later)
export async function POST(req: Request) {

  try {
    const { title, content, authorId } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const adminUserId = authorId;

    const user = await prisma.user.findUnique({
      where: { id: adminUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("POST /post error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
