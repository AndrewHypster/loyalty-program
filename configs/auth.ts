import type { AuthOptions, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authConfig: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.CLIENT_SECRET as string,
    }),
    // Credentials({
    //   credentials: {
    //     email: { label: 'email', type: 'email', required: true },
    //     password: { label: 'password', type: 'password', required: true },
    //   },

    //   async authorize(credentials) {
    //     if (!credentials?.email || !credentials?.password) return null

    //     const resp = await fetch(process.env.NEXT_AUTH + "/api/google-sheets", {
    //       method: "POST",
    //       headers: {
    //         Accept: "application/json",
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         action: "FIND_USER",
    //         email: credentials.email,
    //       }),
    //     });
    //     const data = await resp.json();

    //     if (!data.password) return null;

    //     if (data.password === credentials.password) {
    //       const { password, ...userWithoutPass } = data
    //       return userWithoutPass as User
    //     }

    //     return null
    //   }
    // })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // 🔥 Google login
      if (account?.provider === "google") {
        const resp = await fetch(process.env.NEXT_AUTH + "/api/google-sheets", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "FIND_USER",
            email: user.email,
          }),
        });

        const data = await resp.json();

        // ❗ Якщо користувача нема в sheets — можна створити
        // або не пускати (повернути false)
        if (!data.email) {
          await fetch(process.env.NEXT_AUTH + "/api/tg-bot", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: `Новий користувач\n\nІмя: ${user.name}\nEmail: ${user.email}\nФото: ${user.image}`,
            }),
          });
          // const data = await resp.text();
          return true;
          // return false
        }

        // Записуємо дані у token
        (user as any).sheetUser = data;
      }

      return true;
    },
  },
};
