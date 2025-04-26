import { useEffect, useRef, useState } from "react";
import * as _ from "lodash";
import styles from "./deviceMonitor.module.css";

import Loader from "../Loader";
import TextInput from "../TextInput";
import Dropdown from "../Dropdown";

import { laptopPicto, smartphonePicto } from "./deviceKind";
import { TextInputRef } from "../TextInput/textInput";

export type DeviceMonitorProps = {
  style: React.CSSProperties;
};

type Device = {
  id: string;
  name: string;
  kind: "phone" | "laptop";
  fcmToken: string;
  clients: string[];
  createdAt: string;
};

type Client = {
  id: string;
  name: string;
  kind: "web_extension" | "pam";
  createdAt: string;
};

type Devices = Device[];
type Clients = Client[];

type Update = {
  deviceId: string;
  updates: { [key in keyof Device]?: Device[key] };
};

// const mockDevices: Devices = [
//   {
//     id: "mzdjidnzod",
//     name: "Yellow",
//     kind: "phone",
//     fcmToken: "iedoezjdzuidjzodépdédkdjéoid$ss&é_",
//     clients: ["ddzidzidn"],
//   },
//   {
//     id: "zdoadjazdlp",
//     name: "Laptop",
//     kind: "computer",
//     fcmToken: "iduzbidoezdjzodjédéé''é'",
//     clients: [],
//   },
// ];

// const mockClients: Clients = [
//   {
//     id: "ddzidzidn",
//     name: "Arch PAM",
//     kind: "pam",
//   },
//   {
//     id: "nidgrgionfrf",
//     name: "Arch extension",
//     kind: "firefox-extension",
//   },
// ];

const resetPicto = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11 0V2.44444C15.7166 2.44444 19.5556 6.28223 19.5556 11C19.5556 15.7178 15.7166 19.5556 11 19.5556C6.28344 19.5556 2.44444 15.7178 2.44444 11C2.44444 8.74256 3.34277 6.61711 4.88889 5.03311V7.94444H7.33333V1.22223H0.611107V3.66667H2.80011C1.01567 5.66133 0 8.261 0 11C0 17.0647 4.93411 22 11 22C17.0659 22 22 17.0647 22 11C22 4.93533 17.0659 0 11 0Z"
      fill="var(--main)"
    />
  </svg>
);

const DeviceMonitor = ({ style }: DeviceMonitorProps) => {
  const [devices, setDevices] = useState<Devices | null>(null);
  const [clients, setClients] = useState<Clients | null>(null);
  const [selected, setSelected] = useState<Device | null>(null);
  const [updates, setUpdates] = useState<Update | null>(null);
  const [addState, setAddState] = useState(false);

  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const nameRef = useRef<TextInputRef>(null);
  const fcmTokenRef = useRef<TextInputRef>(null);

  useEffect(() => {
    fetch("/api/avalon/devices").then((devicesRes) => {
      if (devicesRes.status != 200)
        setErrorMessages((old) => [...old, "🔎 Error while fetching the devices"]);
      else
        devicesRes
          .json()
          .then(setDevices)
          .catch((_) =>
            setErrorMessages((old) => [...old, "👀 Error while parsing the devices"])
          );
    });

    fetch("/api/avalon/clients").then((clientsRes) => {
      if (clientsRes.status != 200)
        setErrorMessages((old) => [...old, "🔎 Error while fetching the clients"]);
      else
        clientsRes
          .json()
          .then(setClients)
          .catch((_) =>
            setErrorMessages((old) => [...old, "👀 Error while parsing the clients"])
          );
    });
  }, []);

  const update = <T extends keyof Device>(
    deviceId: string,
    property: T,
    value: Device[T]
  ) => {
    let newUpdates: Update["updates"] = {};
    if (updates == null || updates.deviceId != deviceId)
      newUpdates = { [property]: value };
    else newUpdates = { ...updates.updates, [property]: value };

    const device = devices?.find((d) => d.id == deviceId)!;

    // sort updated client
    if (newUpdates.clients) {
      newUpdates.clients.sort();
      device.clients.sort();
    }

    const deviceProp = device[property];
    if (
      _.isEqual(newUpdates[property], deviceProp) ||
      (newUpdates[property] === "" && deviceProp == null)
    )
      delete newUpdates[property];

    if (Object.keys(newUpdates).length == 0) setUpdates(null);
    else setUpdates({ deviceId, updates: newUpdates });
  };

  const getClients = (): Clients => {
    if (!clients) return [];
    return updates?.deviceId == selected?.id && updates?.updates.clients
      ? updates.updates.clients.map((id) => clients.find((c) => c.id == id)!)
      : selected!.clients.map((id) => clients.find((c) => c.id == id)!);
  };

  return (
    <div style={{ position: "relative", ...style }}>
      {devices && clients ? (
        <div className={styles["horizontal-container"]}>
          <div style={{ flex: 1 }}>
            {selected ? (
              <div key={selected.id}>
                {updates?.deviceId == selected.id ? (
                  <div
                    onClick={() => {
                      // send updates
                      fetch("/api/avalon/devices/" + selected.id, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updates.updates),
                      })
                        .then((r) => r.json())
                        .then((json) => {
                          const newDevice: Device = json;
                          const device = devices.find((d) => d.id == newDevice.id);

                          if (!device) {
                            console.error(
                              "Response is not a device or is not found in the current device list:",
                              json
                            );
                            return;
                          }

                          setDevices(
                            devices.map((d) => (d.id == newDevice.id ? newDevice : d))
                          );
                          setSelected(newDevice);
                          setUpdates(null);
                        });
                    }}
                    className={styles.update}
                  >
                    <svg
                      width="34"
                      height="34"
                      viewBox="0 0 34 34"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.0016 19.9919L31.5138 2.48609M14.4993 20.7791L18.4703 28.7211C19.4299 30.6403 19.9097 31.6 20.5141 31.8572C21.0387 32.0806 21.6384 32.04 22.1283 31.7484C22.6927 31.4123 23.0394 30.3969 23.7328 28.3663L31.2356 6.3936C31.8399 4.62426 32.1419 3.73958 31.9351 3.15434C31.7552 2.64522 31.3548 2.24474 30.8458 2.06486C30.2604 1.8581 29.3758 2.16019 27.6063 2.76435L5.63365 10.2672C3.60301 10.9606 2.58768 11.3073 2.25157 11.8718C1.95988 12.3616 1.91946 12.9613 2.14277 13.4857C2.4001 14.0902 3.35972 14.5701 5.27896 15.5296L13.2209 19.5007C13.5372 19.6588 13.6953 19.7378 13.8322 19.8434C13.9539 19.9372 14.0628 20.0462 14.1565 20.1677C14.2622 20.3047 14.3412 20.4629 14.4993 20.7791Z"
                        stroke="var(--black)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p>Send updates</p>
                  </div>
                ) : (
                  <></>
                )}
                <div className={styles["device-category"]}>
                  <div className={styles["category-name"]}>
                    <h2>ID</h2>
                    {/* <div onClick={() => {}}>{resetPicto}</div> */}
                  </div>
                  <p style={{ color: "var(--grey)" }}>{selected.id}</p>
                </div>
                <div className={styles["device-category"]}>
                  <div className={styles["category-name"]}>
                    <h2>Name</h2>
                    {updates?.deviceId == selected.id &&
                    Object.keys(updates.updates).includes("name") ? (
                      <div
                        className={styles["reset-button"]}
                        onClick={() => {
                          nameRef.current?.setValue(selected.name ?? "");
                          update(selected.id, "name", selected.name);
                        }}
                      >
                        {resetPicto}
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  <TextInput
                    defaultValue={selected.name}
                    placeholder="device name"
                    onChange={(e: any) => {
                      update(selected.id, "name", e.target.value);
                    }}
                    ref={nameRef}
                  />
                </div>
                <div className={styles["device-category"]}>
                  <div className={styles["category-name"]}>
                    <h2>FCM Token</h2>
                    {updates?.deviceId == selected.id &&
                    Object.keys(updates.updates).includes("fcmToken") ? (
                      <div
                        className={styles["reset-button"]}
                        onClick={() => {
                          fcmTokenRef.current?.setValue(selected.fcmToken ?? "");
                          update(selected.id, "fcmToken", selected.fcmToken);
                        }}
                      >
                        {resetPicto}
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  <TextInput
                    defaultValue={selected.fcmToken}
                    placeholder="fcm token"
                    onChange={(e: any) => {
                      update(selected.id, "fcmToken", e.target.value);
                    }}
                    ref={fcmTokenRef}
                  />
                </div>
                <div className={styles["device-category"]}>
                  <div className={styles["category-name"]}>
                    <h2>Clients</h2>
                    {updates?.deviceId == selected.id && updates.updates.clients ? (
                      <div
                        className={styles["reset-button"]}
                        onClick={() => {
                          update(selected.id, "clients", selected.clients);
                        }}
                      >
                        {resetPicto}
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className={styles["tag-container"]}>
                    {getClients().map((c) => {
                      const newClients = getClients()
                        .map((c) => c.id)
                        .filter((id) => id != c.id);
                      return (
                        <a
                          key={c.id}
                          onClick={() => update(selected.id, "clients", newClients)}
                          className={styles["client-tag"]}
                        >
                          {c.name}
                        </a>
                      );
                    })}
                    {getClients().length < clients.length ? (
                      addState ? (
                        <Dropdown
                          list={clients
                            .filter((c) => !getClients().includes(c))
                            .map((c) => {
                              return {
                                id: c.id,
                                name: c.name,
                              };
                            })}
                          autofocus
                          onBlur={() => {
                            setAddState(false);
                          }}
                          onSelected={({ id }) => {
                            const clients = getClients().map((c) => c.id);
                            update(selected.id, "clients", [...clients, id]);
                          }}
                        />
                      ) : (
                        <a
                          onClick={() => setAddState(true)}
                          className={styles["add-tag"]}
                        >
                          +
                        </a>
                      )
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className={styles.devices}>
            {devices.map((device) => {
              let picto = <p>{device.kind}</p>;
              // if (device.kind == "computer") picto = computerPicto;
              if (device.kind == "laptop") picto = laptopPicto;
              else if (device.kind == "phone") picto = smartphonePicto;

              return (
                <div
                  key={device.id}
                  className={
                    styles.device +
                    (selected?.id == device.id ? " " + styles.selected : "")
                  }
                  onClick={() => {
                    if (!selected || device.id != selected.id) {
                      setUpdates(null);
                      setSelected(device);
                    }
                  }}
                >
                  {picto}
                  <span className={styles["device-name"]}>{device.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : errorMessages ? (
        <div
          style={{ display: "flex", flexDirection: "column" }}
          className={styles["loader-container"]}
        >
          {errorMessages.map((m) => (
            <h2 key={m}>{m}</h2>
          ))}
        </div>
      ) : (
        <div className={styles["loader-container"]}>
          <Loader />
        </div>
      )}
    </div>
  );
};

export default DeviceMonitor;
