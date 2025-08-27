import React from "react";

const fetchApi = (url: string, init?: RequestInit) => {
  if (init === undefined) init = {};
  if (!("credentials" in init)) init.credentials = "include";
  return fetch(process.env.NEXT_PUBLIC_API_URI + url, init);
};

class Observer {
  subscribers: ((onSuccess: () => unknown, onFailure: () => unknown) => unknown)[] = [];

  subscribe = (
    subscriber: (onSuccess: () => unknown, onFailure: () => unknown) => unknown
  ) => {
    this.subscribers.push(subscriber);
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      this.subscribers.splice(index, 1);
    };
  };

  tryFetch = (
    uri: string,
    callback: (response: Response) => unknown,
    init?: RequestInit
  ) => {
    fetchApi(uri, init).then(async (first) => {
      if (first.status === 401) {
        window.location.href = `/login?redirect=${window.location.pathname}`;
      }

      if (first.status !== 403) {
        callback(first);
        return;
      }

      if (this.subscribers) {
        const text = await first.text();
        if (text.includes("secured authentication")) {
          this.subscribers.forEach((sub) => {
            sub(
              async () => {
                const second = await fetchApi(uri, init);
                callback(second);
              },
              () => callback(first)
            );
          });
        }
      }

      callback(first);
    });
  };
}

// global context
export const SecuredContext = new Observer();

export const useFetchApi = () => {
  return (uri: string, callback: (response: Response) => unknown, init?: RequestInit) =>
    SecuredContext.tryFetch(uri, callback, init);
};

export const useFetchApiWithState = <T>(
  url: string,
  onError: (e: unknown) => unknown
): [T | null, React.Dispatch<React.SetStateAction<T | null>>, () => void] => {
  const [data, setData] = React.useState<T | null>(null);
  const fetchApi = useFetchApi();

  const updateData = () => {
    fetchApi(url, async (res) => {
      if (res.status !== 200) {
        return onError(await res.text());
      }
      const data = await res.json();
      setData(data);
    });
  };

  React.useEffect(updateData, []);

  return [data, setData, updateData];
};
