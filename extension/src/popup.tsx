import React, { useCallback, useEffect, useState } from "react";

import { createRoot } from "react-dom/client";

function fetchVideoStats() {
  // const url = "http://localhost:3001/stats";
  const url = "https://algomon.kyle-jeffrey.com:3001/stats";
  return fetch(url).then((response) => response.json());
}
const Popup = () => {
  const [videoStats, setVideoStats] = useState({ totalVideos: 0 });
  useEffect(() => {
    fetchVideoStats().then((data) => {
      setVideoStats(data);
    });
  }, []);
  return (
    <div
      style={{
        width: 700,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 15,
      }}
    >
      <h3>Videos Scraped: {videoStats.totalVideos}</h3>
    </div>
  );
};

// ... somewhere else, render it ...
// <BarGraph />

const root = createRoot(document.getElementById("root")!);

root.render(<Popup />);
