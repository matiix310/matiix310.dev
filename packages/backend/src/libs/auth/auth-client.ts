import { createAuthClient } from "better-auth/client";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    (Bun.env.TLS ? "https://" : "http://") +
    Bun.env.HOST +
    (Bun.env.PORT || Bun.env.PORT == 443 ? "" : ":" + Bun.env.PORT),
  plugins: [usernameClient()],
});
