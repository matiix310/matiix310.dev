import { Logger } from "@libs/logPlugin";
import { CanBeError } from "matiix";

type Session = {
  cb: (authenticated: boolean) => void;
  user: string;
  start: number;
};

const validityTime = 20; // in seconds

export default class Auth {
  private logger;

  private sessions: Record<string, Session> = {};
  private sockets: Record<string, (data: any) => void> = {};

  constructor(logger: Logger) {
    this.logger = logger;
  }

  createAuthSession(user: string, cb: Session["cb"]): string {
    // find a unique id
    let id;
    do {
      id = Math.floor(Math.random() * 10000 + 1).toString();
    } while (this.sessions[id]);

    this.sessions[id] = {
      cb,
      user,
      start: Date.now(),
    };

    // Tell the phones to authorize the session
    const sendingList = Object.values(this.sockets);
    if (sendingList.length == 0) this.authorizeSession(id, false);
    else {
      const payload = JSON.stringify({ action: "authorize", data: { id, user } });
      for (let send of sendingList) send(payload);
    }

    // remove the session after validityTime + 5 seconds
    setTimeout(() => {
      if (this.sessions[id]) this.sessions[id].cb(false);
      delete this.sessions[id];
    }, (validityTime + 5) * 1000);

    return id;
  }

  authorizeSession(id: string, authorize: boolean): CanBeError<{ id: string }> {
    const session = this.sessions[id];
    if (!session || Date.now() - session.start > validityTime * 1000)
      return { error: true, message: "Unknown id" };

    delete this.sessions[id];
    session.cb(authorize);

    return { error: false, data: { id } };
  }

  addSocket(id: string, send: (data: any) => void): boolean {
    if (this.sockets[id]) return false;
    this.sockets[id] = send;
    return true;
  }

  removeSocket(id: string): boolean {
    return delete this.sockets[id];
  }
}
