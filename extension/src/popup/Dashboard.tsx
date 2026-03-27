import React, { useEffect, useState } from "react";
import { s } from "./styles";
import { API_BASE, type Credentials, type WordData, type WordsResponse } from "./types";

const now = new Date();
const TODAY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
const TODAY_LABEL = new Date().toLocaleDateString("default", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

export function Dashboard({
  creds,
  onLogout,
}: {
  creds: Credentials;
  onLogout: () => void;
}) {
  const [totalVideos, setTotalVideos] = useState<number | null>(null);
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
        setTotalVideos(data.videoMetrics?.totalVideos ?? 0);
      })
      .catch(() => {});
  }, [creds.username]);

  return (
    <>
      <div style={s.heroSection}>
        <div style={s.heroLabel}>All time</div>
        <div style={s.heroStat}>
          {totalVideos !== null ? totalVideos.toLocaleString() : "—"}
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
