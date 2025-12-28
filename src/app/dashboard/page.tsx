"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Post = {
  id: number;
  title: string;
  content?: string;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  console.log("session", session, status);
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔒 Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // READ (user-specific posts)
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
  const savePost = async () => {
    if (!title.trim()) return;

    setLoading(true);

    const url = editingId ? `/api/post/${editingId}` : "/api/post";
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, authorId: session.user.id }),
    });

    setTitle("");
    setContent("");
    setEditingId(null);
    setLoading(false);
    fetchPosts();
  };

  // EDIT
  const editPost = (post: Post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content || "");
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

        {/* Create / Update Form */}
        {session.user.role === "ADMIN" && <>   <div className="mb-6">
          <input
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-3 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            placeholder="Post content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full mb-4 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            <button
              onClick={savePost}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {editingId ? "Update Post" : "Create Post"}
            </button>

            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setContent("");
                }}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

          <hr className="my-6" />
        </>}
        {/* Posts */}
        <div className="space-y-4">
          {posts.length === 0 && (
            <p className="text-center text-gray-500">
              No posts yet. Create one!
            </p>
          )}

          {posts.map((post) => (
            <div key={post.id} className="border rounded-md p-4 bg-gray-50">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="text-gray-700 mb-3">{post.content}</p>
              {session.user.role === "ADMIN" &&
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
                </div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
