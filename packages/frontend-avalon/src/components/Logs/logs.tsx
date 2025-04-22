import { useEffect, useState } from "react";
import styles from "./logs.module.css";

import Loader from "@/components/Loader";

type Log = {
  deviceName: string;
  deviceID: string;
  authName: string;
  authID: string;
  success: boolean;
  date: number;
};

type groupedLogs = Log[][];

export type LogsProps = { style: React.CSSProperties };

const mockData: Log[] = [
  {
    deviceName: "Laptop",
    deviceID: "IDLaptop",
    authName: "Yellow",
    authID: "IDYellow",
    success: true,
    date: Date.now(),
  },
  {
    deviceName: "Laptop",
    deviceID: "IDLaptop",
    authName: "Yellow",
    authID: "IDYellow",
    success: false,
    date: Date.now() - 1_000_000_000,
  },
  {
    deviceName: "Laptop",
    deviceID: "IDLaptop",
    authName: "Yellow",
    authID: "IDYellow",
    success: true,
    date: Date.now() - 1_000_000,
  },
  {
    deviceName: "Laptop",
    deviceID: "IDLaptop",
    authName: "Yellow",
    authID: "IDYellow",
    success: true,
    date: Date.now() - 90_000_000,
  },
];

const allowedSvg = (
  <svg
    className={[styles.status, styles.allowed].join(" ")}
    width="25"
    height="25"
    viewBox="0 0 25 25"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.6296 6.7425L9.66667 14.7054L5.32875 10.3796L3.625 12.0833L9.66667 18.125L19.3333 8.45833L17.6296 6.7425ZM12.0833 0C5.41333 0 0 5.41333 0 12.0833C0 18.7533 5.41333 24.1667 12.0833 24.1667C18.7533 24.1667 24.1667 18.7533 24.1667 12.0833C24.1667 5.41333 18.7533 0 12.0833 0ZM12.0833 21.75C6.7425 21.75 2.41667 17.4242 2.41667 12.0833C2.41667 6.7425 6.7425 2.41667 12.0833 2.41667C17.4242 2.41667 21.75 6.7425 21.75 12.0833C21.75 17.4242 17.4242 21.75 12.0833 21.75Z" />
  </svg>
);

const deniedSvg = (
  <svg
    className={[styles.status, styles.denied].join(" ")}
    width="25"
    height="25"
    viewBox="0 0 25 25"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.5 0C5.61125 0 0 5.61125 0 12.5C0 19.3888 5.61125 25 12.5 25C19.3888 25 25 19.3888 25 12.5C25 5.61125 19.3888 0 12.5 0ZM12.5 2.5C18.0377 2.5 22.5 6.96235 22.5 12.5C22.5 14.8163 21.7116 16.9382 20.3979 18.6304L6.36963 4.60205C8.0618 3.28842 10.1837 2.5 12.5 2.5ZM4.60205 6.36963L18.6304 20.3979C16.9382 21.7116 14.8163 22.5 12.5 22.5C6.96235 22.5 2.5 18.0377 2.5 12.5C2.5 10.1837 3.28842 8.0618 4.60205 6.36963Z" />
  </svg>
);

const arrow = (
  <svg
    className={styles.arrow}
    width="19"
    height="19"
    viewBox="0 0 19 19"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_150_38)">
      <path
        d="M9.37402 7.65933V3.15933H11.624L18.374 9.90933L11.624 16.6593H9.37402V12.1593H0.374024L0.374023 7.65933H9.37402Z"
        fill="var(--white)"
      />
    </g>
    <defs>
      <clipPath id="clip0_150_38">
        <rect
          width="18"
          height="18"
          fill="var(--white)"
          transform="translate(0.374023 0.909332)"
        />
      </clipPath>
    </defs>
  </svg>
);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "Jully",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Logs = ({ style }: LogsProps) => {
  const [groupedLogs, setGroupedLogs] = useState<groupedLogs | null>(null);

  useEffect(() => {
    // fetch the logs from the api
    setTimeout(() => {
      // fetch the logs
      const logs: Log[] = mockData;

      // format logs
      const groupedLogsTemp: groupedLogs = [];
      logs.sort((a, b) => b.date - a.date);
      let oldDate: Date | null = null;
      for (let log of logs) {
        // get the date
        const date = new Date(log.date);
        if (
          !oldDate ||
          date.getDate() != oldDate.getDate() ||
          date.getMonth() != oldDate.getMonth() ||
          date.getFullYear() != oldDate.getFullYear()
        )
          groupedLogsTemp.push([]);
        groupedLogsTemp[groupedLogsTemp.length - 1].push(log);
        oldDate = date;
      }
      setGroupedLogs(groupedLogsTemp);
    }, 3000);
  }, []);

  return (
    <>
      <div style={style}>
        {groupedLogs ? (
          groupedLogs.map((dailyLogs) => {
            const date = new Date(dailyLogs[0].date);
            return (
              <div key={dailyLogs[0].date}>
                <h2 className={styles.date}>
                  {date.getDate()} {months[date.getMonth()]} {date.getFullYear()}
                </h2>
                {dailyLogs.map((log, i) => {
                  const date = new Date(log.date);
                  return (
                    <div key={"log_" + i} className={styles.log}>
                      <div className={styles.left}>
                        {log.success ? allowedSvg : deniedSvg}
                        <p>{log.deviceName}</p>
                        {arrow}
                        <p>{log.authName}</p>
                      </div>
                      <div className={styles.right}>
                        <p>
                          {date.getHours()}:{String(date.getMinutes()).padStart(2, "0")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          <div className={styles["loader-container"]}>
            <Loader />
          </div>
        )}
      </div>
    </>
  );
};

export default Logs;
