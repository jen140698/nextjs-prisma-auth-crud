"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: true,
      callbackUrl: "/dashboard",
    });
    // (await cookieStore).set("authToken", "true", {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "strict",
    //   path: "/",
    // });


    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <form
        onSubmit={login}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-8"
      >
        <h1 className="text-2xl font-bold text-center mb-6">
          Welcome Back 👋
        </h1>

        {/* Email */}
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Password */}
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          required
          className="w-full mb-6 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
