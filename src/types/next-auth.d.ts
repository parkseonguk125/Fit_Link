import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "TRAINER";
    } & DefaultSession["user"];
  }

  interface User {
    role: "USER" | "TRAINER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "TRAINER";
  }
}
