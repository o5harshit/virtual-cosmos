import { useState } from "react";
import { toast } from "react-hot-toast";

export function LoginScreen({ onJoin }) {
  const [name, setName] = useState("");

  function submitForm(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    // ❌ Empty check
    if (!trimmedName) {
      toast.error("Name cannot be empty ❌");
      return;
    }

    // ❌ Length check
    if (trimmedName.length <= 5) {
      toast.error("Name must be more than 5 characters ⚠️");
      return;
    }

    // ✅ Valid
    onJoin(trimmedName);
  }

  return (
    <main className="login-screen">
      <form className="login-card" onSubmit={submitForm}>
        <p className="eyebrow">Virtual Cosmos</p>
        <h1>Enter the room</h1>
        <p>Move close to another player to open chat. Walk away to close it.</p>

        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          maxLength={18}
        />

        <button>Join cosmos</button>
      </form>
    </main>
  );
}