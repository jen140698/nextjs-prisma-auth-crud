"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";

type RegisterForm = {
  email: string;
  password: string;
  role: "USER" | "ADMIN";
};

export default function Register() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      role: "USER",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Registration failed");
        return;
      }

      router.push("/login");
    } catch (err) {
      setServerError("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        {/* Email */}
        <label className="block mb-1 text-sm font-medium">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address",
            },
          })}
          className={`w-full mb-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.email
              ? "border-red-500 focus:ring-red-500"
              : "focus:ring-blue-500"
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mb-3">
            {errors.email.message}
          </p>
        )}

        {/* Password */}
        <label className="block mb-1 text-sm font-medium">Password</label>
        <input
          type="password"
          placeholder="********"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 3,
              message: "Password must be at least 3 characters",
            },
          })}
          className={`w-full mb-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.password
              ? "border-red-500 focus:ring-red-500"
              : "focus:ring-blue-500"
          }`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mb-3">
            {errors.password.message}
          </p>
        )}

        {/* Role */}
        <label className="block mb-1 text-sm font-medium">Role</label>
        <select
          {...register("role")}
          className="w-full mb-6 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="USER">User</option>
          <option value="ADMIN">Author</option>
        </select>

        {/* Server Error */}
        {serverError && (
          <p className="text-red-600 text-sm mb-4 text-center">
            {serverError}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
