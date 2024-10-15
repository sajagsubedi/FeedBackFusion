import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import connectDb from "@/lib/connectDb";
import UserModel from "@/models/User.model";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials: any): Promise<any> {
        await connectDb();
        try {
          const existingUser = await UserModel.findOne({
            $or: [
              { email: credentials?.identifier },
              { username: credentials?.identifier },
            ],
          });

          if (!existingUser) {
            throw new Error("Please enter correct credentials!");
          }

          if (!existingUser.isVerified) {
            throw new Error("Please verify your account before signing in!");
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials?.password,
            existingUser.password
          );
          if (!isPasswordCorrect) {
            throw new Error("Please enter correct credentials!");
          }

          return existingUser;
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.username = user.username;
        token.isVerified = user.isVerified;
        token.isAcceptingMesages = user.isAcceptingMesages;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMesages = token.isAcceptingMesages;
      }
      return session;
    },
  },
  secret: process.env.SECRET_KEY,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
};
