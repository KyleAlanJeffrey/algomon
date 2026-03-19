import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const API_BASE = process.env.API_BASE || "https://algomon.kylejeffrey.com";

const TODAY = new Date().toISOString().split("T")[0]!;
const TODAY_LABEL = new Date().toLocaleDateString("default", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

interface WordData {
  text: string;
  timesSeen: number;
}

interface Stats {
  totalVideos: number;
}

interface WordsResponse {
  videoMetrics: { totalVideos: number };
  wordData: WordData[];
}

interface Credentials {
  username: string;
  name: string;
  apiSecret: string;
}

const s: Record<string, React.CSSProperties> = {
  wrap: {
    width: 360,
    background: "#0a0a0a",
    color: "#fff",
    fontFamily: "-apple-system, 'Segoe UI', sans-serif",
    overflow: "hidden",
  },
  header: {
    padding: "14px 18px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  logo: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.22em",
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
  },
  openLink: {
    fontSize: 11,
    fontWeight: 600,
    color: "#A855F7",
    textDecoration: "none",
    letterSpacing: "0.04em",
    cursor: "pointer",
  },
  heroSection: {
    padding: "22px 18px 18px",
    background:
      "linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(236,72,153,0.08) 100%)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.38)",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroStat: {
    fontSize: 56,
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: "-0.03em",
    color: "#fff",
  },
  heroSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.38)",
    marginTop: 5,
    fontWeight: 500,
  },
  section: {
    padding: "14px 18px",
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.32)",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  todayCount: {
    fontSize: 30,
    fontWeight: 900,
    letterSpacing: "-0.02em",
    color: "#A855F7",
    lineHeight: 1,
    marginBottom: 3,
  },
  todayLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.38)",
    fontWeight: 500,
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.06)",
    margin: "0 18px",
  },
  wordRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 0",
  },
  wordText: {
    fontSize: 13,
    fontWeight: 600,
    color: "rgba(255,255,255,0.82)",
  },
  wordCount: {
    fontSize: 11,
    color: "rgba(255,255,255,0.28)",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
  emptyState: {
    fontSize: 12,
    color: "rgba(255,255,255,0.28)",
    textAlign: "center",
    padding: "10px 0",
    lineHeight: 1.5,
  },
  footer: {
    padding: "10px 18px",
    display: "flex",
    justifyContent: "center",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  footerText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.16)",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  // Login form styles
  loginSection: {
    padding: "24px 18px",
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.38)",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.15em",
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    fontSize: 13,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6,
    color: "#fff",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  button: {
    width: "100%",
    padding: "10px",
    fontSize: 13,
    fontWeight: 700,
    background: "#A855F7",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginTop: 6,
  },
  buttonDisabled: {
    width: "100%",
    padding: "10px",
    fontSize: 13,
    fontWeight: 700,
    background: "rgba(168,85,247,0.4)",
    color: "rgba(255,255,255,0.5)",
    border: "none",
    borderRadius: 6,
    cursor: "not-allowed",
    marginTop: 6,
  },
  error: {
    fontSize: 11,
    color: "#f87171",
    marginTop: 8,
    textAlign: "center",
  },
  userBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoutBtn: {
    fontSize: 10,
    fontWeight: 600,
    color: "rgba(255,255,255,0.3)",
    background: "none",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 4,
    padding: "2px 8px",
    cursor: "pointer",
  },
};

function LoginForm({ onLogin }: { onLogin: (c: Credentials) => void }) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = username.trim() && apiSecret.trim() && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const creds: Credentials = {
      username: username.trim(),
      name: name.trim() || username.trim(),
      apiSecret: apiSecret.trim(),
    };

    try {
      // Validate the key by sending a test request (also creates the user)
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

      if (res.status === 401) {
        setError("Invalid API secret");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Server error — try again");
        setLoading(false);
        return;
      }

      // Save credentials
      chrome.storage.local.set(creds, () => {
        onLogin(creds);
      });
    } catch {
      setError("Could not reach server");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={s.loginSection}>
        <div style={s.loginTitle}>Set up Algomon</div>
        <div style={s.loginSubtitle}>
          Enter your username and API secret to start tracking.
        </div>

        <div style={s.inputGroup}>
          <label style={s.label}>Username</label>
          <input
            style={s.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your-username"
            autoFocus
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

        <div style={s.inputGroup}>
          <label style={s.label}>API Secret</label>
          <input
            style={s.input}
            type="password"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            placeholder="Paste your API secret"
          />
        </div>

        <button
          type="submit"
          style={canSubmit ? s.button : s.buttonDisabled}
          disabled={!canSubmit}
        >
          {loading ? "Connecting..." : "Sign In"}
        </button>

        {error && <div style={s.error}>{error}</div>}
      </div>
    </form>
  );
}

function Dashboard({ creds, onLogout }: { creds: Credentials; onLogout: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayWords, setTodayWords] = useState<WordData[]>([]);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/users/${creds.username}/words?date=${TODAY}&limit=5`)
      .then((r) => r.json() as Promise<WordsResponse>)
      .then((data) => {
        setTodayWords(data.wordData ?? []);
        setTodayCount(
          new Set(data.wordData?.flatMap((w) => (w as any).videoUrls ?? [])).size
        );
        setStats({ totalVideos: data.videoMetrics?.totalVideos ?? 0 });
      })
      .catch(() => {});
  }, [creds.username]);

  return (
    <>
      <div style={s.heroSection}>
        <div style={s.heroLabel}>All time</div>
        <div style={s.heroStat}>
          {stats ? stats.totalVideos.toLocaleString() : "—"}
        </div>
        <div style={s.heroSub}>videos seen</div>
      </div>

      <div style={s.section}>
        <div style={s.sectionLabel}>{TODAY_LABEL}</div>
        <div style={s.todayCount}>{todayCount.toLocaleString()}</div>
        <div style={s.todayLabel}>videos today</div>
      </div>

      <div style={s.divider} />

      <div style={s.section}>
        <div style={s.sectionLabel}>Today's top words</div>
        {todayWords.length === 0 ? (
          <div style={s.emptyState}>
            Browse YouTube to
            <br />
            start seeing words
          </div>
        ) : (
          todayWords.map((w) => (
            <div key={w.text} style={s.wordRow}>
              <span style={s.wordText}>{w.text}</span>
              <span style={s.wordCount}>{w.timesSeen}×</span>
            </div>
          ))
        )}
      </div>

      <div style={s.divider} />

      <div
        style={{
          padding: "12px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={s.userBadge}>@{creds.username}</span>
        <button style={s.logoutBtn} onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </>
  );
}

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
