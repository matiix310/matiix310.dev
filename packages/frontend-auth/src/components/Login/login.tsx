import styles from "./login.module.css";

import { useRef } from "react";

import { authClient } from "../../lib/auth-client";
import { Notif } from "../Notifs/notifs";

export type LoginProps = {
  containerStyles?: React.CSSProperties;
  addNotif?: (notif: Notif) => void;
};

const Login = ({ containerStyles, addNotif }: LoginProps) => {
  const loginRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const sendNotif = (title: string, content: string, success?: boolean) => {
    const notif = {
      title,
      content,
      success,
    };

    if (!addNotif) {
      console.log(notif);
      return;
    }

    addNotif(notif);
  };

  return (
    <>
      <div className={[styles.login, containerStyles].join(" ")}>
        <h1 className={styles.welcome}>Welcome</h1>
        <form
          className={styles["login-form"]}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!loginRef.current || !passwordRef.current)
              return sendNotif("Erreur", "Can't read login / password");

            const login = loginRef.current.value;
            const password = passwordRef.current.value;

            loginRef.current.value = "";
            passwordRef.current.value = "";

            if (!login || !password)
              return sendNotif("Erreur", "Login or Password is empty");
            const res = await authClient.signIn.username({
              username: login,
              password: password,
            });

            if (res.error) {
              console.error(res.error);
              return sendNotif(
                "Erreur",
                res.error.message ?? "Error during the authentication"
              );
            }

            sendNotif("Success", "Login successful", true);
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
