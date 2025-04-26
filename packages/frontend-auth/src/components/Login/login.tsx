import styles from "./login.module.css";

import { authClient } from "../../lib/auth-client";
import { useRef } from "react";

const Login = () => {
  const loginRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className={styles.login}>
        <h1 className={styles.welcome}>Welcome</h1>
        <form
          className={styles["login-form"]}
          onSubmit={async (e) => {
            e.preventDefault();
            const login = loginRef.current?.value;
            const password = passwordRef.current?.value;

            if (!login || !password) return;
            const res = await authClient.signIn.username({
              username: login,
              password: password,
            });

            console.log(res);
          }}
        >
          <input
            type="text"
            name="login"
            id="login"
            placeholder="login"
            autoFocus
            ref={loginRef}
          />
          <input
            type="password"
            name="password"
            id="password"
            placeholder="password"
            ref={passwordRef}
          />
          <input type="submit" value="submit" />
        </form>
      </div>
    </>
  );
};

export default Login;
