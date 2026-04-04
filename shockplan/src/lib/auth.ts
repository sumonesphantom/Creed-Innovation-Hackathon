import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { connectToDatabase } from "./mongodb";
import { User } from "./models";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        await User.findOneAndUpdate(
          { email: user.email },
          {
            email: user.email,
            name: user.name,
            image: user.image,
            provider: "google",
            providerId: account.providerAccountId,
            lastLoginAt: new Date(),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.id = dbUser._id.toString();
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  trustHost: true,
});
