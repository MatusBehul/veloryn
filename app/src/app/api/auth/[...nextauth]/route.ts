import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      return true;
    },
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, account, user }) {
      return token;
    },
  },
});

export { handler as GET, handler as POST };
