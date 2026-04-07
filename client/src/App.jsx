import { useState } from "react";
import "./App.css";
import { LoginScreen } from "./components/LoginScreen.jsx";
import { TopBar } from "./components/TopBar.jsx";
import { CosmosCanvas } from "./components/CosmosCanvas.jsx";
import { SidePanel } from "./components/SidePanel.jsx";
import { useCosmosSocket } from "./hooks/useCosmosSocket.js";
import { Toaster } from "react-hot-toast";

function App() {
  const [joined, setJoined] = useState(false);
  const [movementLocked, setMovementLocked] = useState(false);
  const cosmos = useCosmosSocket();

  function joinCosmos(name) {
    cosmos.join(name);
    setJoined(true);
  }

  if (!joined) {
    return (
      <>
        <Toaster position="top-right" /> <LoginScreen onJoin={joinCosmos} />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <main className="app-shell">
        <TopBar />

        <section className="workspace">
          <CosmosCanvas
            me={cosmos.me}
            world={cosmos.world}
            users={cosmos.users}
            connections={cosmos.connections}
            onMove={cosmos.movePlayer}
            movementLocked={movementLocked}
          />

          <SidePanel
            connections={cosmos.connections}
            messages={cosmos.messages}
            onSendMessage={cosmos.sendMessage}
            onTypingChange={setMovementLocked}
          />
        </section>
      </main>
    </>
  );
}

export default App;
