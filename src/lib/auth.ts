import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import { cookies } from "next/headers";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string;
            email: string;
            role: string;
        };
    }
}
export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },

    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { type: "text" },
                password: { type: "password" },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                const cookieStore = await cookies();
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) return null;

                const valid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!valid) return null;

                cookieStore.set("authToken", "true", {
                    httpOnly: true,
                    path: "/",
                });
                return user;
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }: { token: any; user?: any }) {

            if (user) { token.id = user.id; token.role = user.role; }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
};
