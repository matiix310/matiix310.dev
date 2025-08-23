import { createAuthClient } from "better-auth/client";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: (Bun.env.NODE_ENV === "production" ? "https://" : "http://") + Bun.env.HOST,
  plugins: [usernameClient()],
});
