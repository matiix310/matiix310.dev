import Login from "./components/Login";
import Background from "./components/Background";
import Notifs from "./components/Notifs";
import { useRef } from "react";
import { Notif, NotifsRef } from "./components/Notifs/notifs";

function App() {
  const notifsRef = useRef<NotifsRef>(null);

  return (
    <>
      <Notifs ref={notifsRef} />
      <Background />
      <div className="center">
        <Login
          addNotif={(notif: Notif) => {
            if (notifsRef.current) notifsRef.current.addNotif(notif);
          }}
        />
      </div>
    </>
  );
}

export default App;
