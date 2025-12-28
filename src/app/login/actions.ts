"use server";

import { signIn } from "next-auth/react";

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  await signIn("credentials", {
    email,
    password,
    role: "ADMIN",
    redirectTo: "/dashboard",
  });
}
