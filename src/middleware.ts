// middleware.ts
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function middleware(req) {
  const token = await getToken({ req })
  const { pathname } = req.nextUrl

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/dashboard/:path*"],
}
