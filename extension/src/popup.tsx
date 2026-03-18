import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const API_BASE = process.env.API_BASE ?? "https://algomon.kyle-jeffrey.com";

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
};

const Popup = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayWords, setTodayWords] = useState<WordData[]>([]);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});

    fetch(`${API_BASE}/api/words?date=${TODAY}&limit=5`)
      .then((r) => r.json() as Promise<WordsResponse>)
      .then((data) => {
        setTodayWords(data.wordData ?? []);
        setTodayCount(data.videoMetrics?.totalVideos ?? 0);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.logo}>Algomon</span>
        <a
          href={API_BASE}
          target="_blank"
          rel="noopener noreferrer"
          style={s.openLink}
        >
          Dashboard ↗
        </a>
      </div>

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

      <div style={s.footer}>
        <span style={s.footerText}>algomon</span>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
