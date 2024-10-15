import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id?: string;
      username?: string;
      isVerified?: boolean;
      isAcceptingMesages?: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    _id?: string;
    username?: string;
    isVerified?: boolean;
    isAcceptingMesages?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    username?: string;
    isVerified?: boolean;
    isAcceptingMesages?: boolean;
  }
}
