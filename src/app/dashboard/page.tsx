"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type Post = {
  id: number;
  title: string;
  content?: string;
};

type PostFormValues = {
  title: string;
  content: string;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostFormValues>({
    mode: "onSubmit",
  });

  // 🔒 Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // READ posts
  const fetchPosts = async () => {
    const res = await fetch("/api/post");
    if (res.ok) {
      setPosts(await res.json());
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchPosts();
    }
  }, [status]);

  // CREATE / UPDATE
  const onSubmit = async (data: PostFormValues) => {
    setLoading(true);

    const url = editingId ? `/api/post/${editingId}` : "/api/post";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        authorId: session?.user?.id,
      }),
    });

    reset();
    setEditingId(null);
    setLoading(false);
    fetchPosts();
  };

  // EDIT
  const editPost = (post: Post) => {
    setEditingId(post.id);
    reset({
      title: post.title,
      content: post.content || "",
    });
  };

  // DELETE
  const deletePost = async (id: number) => {
    await fetch(`/api/post/${id}`, { method: "DELETE" });
    fetchPosts();
  };

  if (status === "loading") {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          📝 Blog Dashboard
        </h1>

        {/* ADMIN FORM */}
        {session?.user?.role === "ADMIN" && (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
              {/* Title */}
              <input
                placeholder="Post title"
                className={`w-full mb-1 px-4 py-2 border rounded-md focus:ring-2 ${
                  errors.title
                    ? "border-red-500 focus:ring-red-400"
                    : "focus:ring-blue-500"
                }`}
                {...register("title", {
                  required: "Title is required",
                  minLength: {
                    value: 3,
                    message: "Title must be at least 3 characters",
                  },
                })}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mb-3">
                  {errors.title.message}
                </p>
              )}

              {/* Content */}
              <textarea
                placeholder="Post content"
                rows={4}
                className={`w-full mb-1 px-4 py-2 border rounded-md focus:ring-2 ${
                  errors.content
                    ? "border-red-500 focus:ring-red-400"
                    : "focus:ring-blue-500"
                }`}
                {...register("content", {
                  required: "Content is required",
                  minLength: {
                    value: 10,
                    message: "Content must be at least 10 characters",
                  },
                })}
              />
              {errors.content && (
                <p className="text-red-500 text-xs mb-3">
                  {errors.content.message}
                </p>
              )}

              {/* Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {editingId ? "Update Post" : "Create Post"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setEditingId(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <hr className="my-6" />
          </>
        )}

        {/* POSTS LIST */}
        <div className="space-y-4">
          {posts.length === 0 && (
            <p className="text-center text-gray-500">
              No posts available.
            </p>
          )}

          {posts.map((post) => (
            <div key={post.id} className="border rounded-md p-4 bg-gray-50">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="text-gray-700 mb-3">{post.content}</p>

              {session?.user?.role === "ADMIN" && (
                <div className="flex gap-4 text-sm">
                  <button
                    onClick={() => editPost(post)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
