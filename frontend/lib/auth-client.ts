import { createAuthClient } from "better-auth/react";
import {
  apiKeyClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  plugins: [usernameClient(), apiKeyClient(), twoFactorClient()],
});
