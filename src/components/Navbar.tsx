"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex items-center justify-between">
      {/* Left */}
      <Link href="/dashboard" className="text-xl font-bold text-blue-600">
        BlogApp
      </Link>

      {/* Right */}
      {session ? (
        <div className="flex items-center gap-4">
          <span className="text-gray-700 text-sm">
            {session.user.email}
          </span>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="text-blue-600 hover:underline text-sm"
        >
          Login
        </Link>
      )}
    </nav>
  );
}
