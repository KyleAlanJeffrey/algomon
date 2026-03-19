import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { s } from "./popup/styles";
import { API_BASE, type Credentials } from "./popup/types";
import { LoginForm } from "./popup/LoginForm";
import { Dashboard } from "./popup/Dashboard";

const Popup = () => {
  const [creds, setCreds] = useState<Credentials | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(["username", "name", "apiSecret"], (result) => {
      if (result.username && result.apiSecret) {
        setCreds({
          username: result.username,
          name: result.name || result.username,
          apiSecret: result.apiSecret,
        });
      }
      setLoading(false);
    });
  }, []);

  function handleLogout() {
    chrome.storage.local.remove(["username", "name", "apiSecret"], () => {
      setCreds(null);
    });
  }

  if (loading) return <div style={s.wrap} />;

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.logo}>Algomon</span>
        {creds && (
          <a
            href={API_BASE}
            target="_blank"
            rel="noopener noreferrer"
            style={s.openLink}
            onClick={(e) => {
              e.preventDefault();
              chrome.tabs.create({ url: API_BASE });
            }}
          >
            Dashboard ↗
          </a>
        )}
      </div>

      {creds ? (
        <Dashboard creds={creds} onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={setCreds} />
      )}

      <div style={s.footer}>
        <span style={s.footerText}>algomon</span>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
