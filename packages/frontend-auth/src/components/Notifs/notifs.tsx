import { forwardRef, useImperativeHandle, useState } from "react";
import styles from "./notifs.module.css";

export type Notif = {
  title: string;
  content: string;
  success?: boolean;
};

type AddStartTime<T> = T & {
  start: number;
};

export type NotifsRef = {
  addNotif: (notif: Notif) => void;
};

export type NotifsProps = {};

const Notifs = forwardRef<NotifsRef, NotifsProps>((_, ref) => {
  const [notifs, setNotifs] = useState<AddStartTime<Notif>[]>([]);

  const removeNotif = (notif: AddStartTime<Notif>) => {
    setNotifs((old) =>
      old.filter(
        (n) =>
          n.start != notif.start || n.title != notif.title || n.content != notif.content
      )
    );
  };

  const addNotif = (notif: Notif) => {
    const start = Date.now();
    setNotifs((old) => [{ start, ...notif }, ...old]);
    setTimeout(() => {
      removeNotif({ start, ...notif });
    }, 5000);
  };

  useImperativeHandle(ref, () => ({
    addNotif,
  }));

  return (
    <div className={styles.notifs}>
      {notifs.map((n) => (
        <div className={styles.notif + (n.success ? " " + styles.success : "")}>
          <h2>{n.title}</h2>
          <p>{n.content}</p>
        </div>
      ))}
    </div>
  );
});

export default Notifs;
