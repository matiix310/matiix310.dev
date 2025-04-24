import Logs from "@/components/Logs";
import DeviceMonitor from "@/components/DeviceMonitor";

function App() {
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100vw",
          height: "100vh",
        }}
      >
        <h1 style={{ margin: "30px", fontSize: "50px" }}>🔒 Avalon - Fleet Manager</h1>
        <div
          style={{
            display: "flex",
            height: "100%",
          }}
        >
          <Logs style={{ flex: 1, margin: "0 30px" }} />
          <div
            style={{
              height: "90%",
              width: "2px",
              margin: "0 20px",
              backgroundColor: "var(--grey)",
              opacity: 0.2,
            }}
          ></div>
          <DeviceMonitor style={{ flex: 1 }} />
        </div>
      </div>
    </>
  );
}

export default App;
