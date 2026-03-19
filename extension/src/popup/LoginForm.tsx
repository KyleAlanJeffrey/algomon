import React, { useEffect, useState } from "react";
import { s } from "./styles";
import { API_BASE, type Credentials, type User } from "./types";

type Mode = "pick" | "create";

async function validateKey(creds: Credentials): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/videos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": creds.apiSecret,
      },
      body: JSON.stringify([
        { username: creds.username, name: creds.name, url: "", title: "" },
      ]),
    });
    if (res.status === 401) return { ok: false, error: "Invalid API secret" };
    if (!res.ok) return { ok: false, error: "Server error — try again" };
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach server" };
  }
}

function saveCreds(creds: Credentials, onLogin: (c: Credentials) => void) {
  chrome.storage.local.set(creds, () => onLogin(creds));
}

export function LoginForm({ onLogin }: { onLogin: (c: Credentials) => void }) {
  const [mode, setMode] = useState<Mode>("pick");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // "Create new" form state
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  // Shared state
  const [apiSecret, setApiSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch existing users on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/users`)
      .then((r) => r.json() as Promise<User[]>)
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoadingUsers(false);
      })
      .catch(() => setLoadingUsers(false));
  }, []);

  async function handlePickUser(user: User) {
    if (!apiSecret.trim()) {
      setError("Enter the API secret first");
      return;
    }
    setLoading(true);
    setError("");
    const creds: Credentials = {
      username: user.username,
      name: user.name,
      apiSecret: apiSecret.trim(),
    };
    const result = await validateKey(creds);
    if (!result.ok) {
      setError(result.error!);
      setLoading(false);
      return;
    }
    saveCreds(creds, onLogin);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !apiSecret.trim()) return;
    setLoading(true);
    setError("");
    const creds: Credentials = {
      username: username.trim(),
      name: name.trim() || username.trim(),
      apiSecret: apiSecret.trim(),
    };
    const result = await validateKey(creds);
    if (!result.ok) {
      setError(result.error!);
      setLoading(false);
      return;
    }
    saveCreds(creds, onLogin);
  }

  return (
    <div style={s.loginSection}>
      <div style={s.loginTitle}>Set up Algomon</div>
      <div style={s.loginSubtitle}>
        {mode === "pick"
          ? "Choose your account and enter the API secret."
          : "Create a new account to start tracking."}
      </div>

      {/* API secret — always shown */}
      <div style={s.inputGroup}>
        <label style={s.label}>API Secret</label>
        <input
          style={s.input}
          type="password"
          value={apiSecret}
          onChange={(e) => { setApiSecret(e.target.value); setError(""); }}
          placeholder="Paste your API secret"
          autoFocus
        />
      </div>

      {mode === "pick" ? (
        <>
          {/* Existing user list */}
          <div style={{ ...s.sectionLabel, marginTop: 4 }}>Choose account</div>
          {loadingUsers ? (
            <div style={s.emptyState}>Loading users...</div>
          ) : users.length === 0 ? (
            <div style={s.emptyState}>No existing users found</div>
          ) : (
            users.map((u) => (
              <div
                key={u.username}
                style={{
                  ...s.userItem,
                  opacity: loading ? 0.5 : 1,
                  pointerEvents: loading ? "none" : "auto",
                }}
                onClick={() => handlePickUser(u)}
              >
                <div>
                  <div style={s.userItemName}>{u.name}</div>
                  <div style={s.userItemUsername}>@{u.username}</div>
                </div>
                <span style={s.userItemArrow}>›</span>
              </div>
            ))
          )}

          <div style={s.divider} />

          <button
            style={s.buttonOutline}
            onClick={() => { setMode("create"); setError(""); }}
          >
            Create New Account
          </button>
        </>
      ) : (
        <form onSubmit={handleCreateSubmit}>
          <div style={s.inputGroup}>
            <label style={s.label}>Username</label>
            <input
              style={s.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-username"
            />
          </div>

          <div style={s.inputGroup}>
            <label style={s.label}>Display Name</label>
            <input
              style={s.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name (optional)"
            />
          </div>

          <button
            type="submit"
            style={
              username.trim() && apiSecret.trim() && !loading
                ? s.button
                : s.buttonDisabled
            }
            disabled={!username.trim() || !apiSecret.trim() || loading}
          >
            {loading ? "Connecting..." : "Create & Sign In"}
          </button>

          <button
            type="button"
            style={s.buttonOutline}
            onClick={() => { setMode("pick"); setError(""); }}
          >
            Back to User List
          </button>
        </form>
      )}

      {error && <div style={s.error}>{error}</div>}
    </div>
  );
}
