import React, { useCallback, useEffect, useState } from "react";
import { Text } from "@visx/text";
import { scaleLog } from "@visx/scale";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud";

import { createRoot } from "react-dom/client";
import { getTodayString } from "./helpers";
import { run } from "node:test";
import { useLiveQuery } from "dexie-react-hooks";
window.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      // ...and send a request for the DOM info...
      if (!tabs[0].id) {
        return;
      }
      chrome.tabs.sendMessage(
        tabs[0].id,
        { from: "popup", subject: "getVideos" },
        // ...also specifying a callback to be called
        //    from the receiving end (content script).
        (response) => console.log(response)
      );
    }
  );
});
const blacklistWords = [
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "at",
  "with",
  "without",
  "for",
  "from",
  "by",
  "about",
  "is",
  "are",
  "what",
  "why",
  "how",
  "i",
  "my",
  "into",
  "more",
  'dir="auto"',
  "<span",
  "&amp",
  "&amp;",
  'class="style-scope',
  "style-scope",
  "video)",
];
const userBlacklistWords = ["(official"];
interface ExampleProps {
  width: number;
  height: number;
  showControls?: boolean;
}

export interface WordData {
  text: string;
  value: number;
}
// if (videos) {
//   const allTitles = videos.map((v) => v.title);
//   setTitles(allTitles);
//   const allText = allTitles.join(" ");
//   const allWords = wordFreq(allText);
//   const filteredWords = allWords.filter(
//     (word) =>
//       !blacklistWords.includes(word.text.toLowerCase()) &&
//       !userBlacklistWords.includes(word.text.toLowerCase())
//   );
//   setWords(filteredWords);
// }

const colors = ["#143059", "#2F6B9A", "#82a6c2"];
function wordFreq(text: string): WordData[] {
  const words: string[] = text.replace(/\./g, "").split(/\s/);
  const freqMap: Record<string, number> = {};

  for (const w of words) {
    if (!freqMap[w]) freqMap[w] = 0;
    freqMap[w] += 1;
  }
  return Object.keys(freqMap).map((word) => ({
    text: word,
    value: freqMap[word],
  }));
}

function getRotationDegree() {
  const rand = Math.random();
  const degree = rand > 0.5 ? 60 : -60;
  return rand * degree;
}

const fixedValueGenerator = () => 0.5;

type SpiralType = "archimedean" | "rectangular";

const Popup = () => {
  const [titles, setTitles] = useState<string[]>([]);
  const [spiralType, setSpiralType] = useState<SpiralType>("archimedean");
  const [withRotation, setWithRotation] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [words, setWords] = useState<WordData[]>([]);

  useEffect(() => {}, []);
  return (
    <div style={{ width: 600 }}>
      <h1>Word Cloud</h1>
      <h4>Total Titles: {titles.length}</h4>
      <div className="wordcloud">
        <Wordcloud
          words={words}
          width={500}
          height={500}
          fontSize={(datum: WordData) =>
            scaleLog({
              domain: [
                Math.min(...words.map((w) => w.value)),
                Math.max(...words.map((w) => w.value)),
              ],
              range: [10, 100],
            })(datum.value)
          }
          font={"Impact"}
          padding={2}
          spiral={spiralType}
          rotate={withRotation ? getRotationDegree : 0}
          random={fixedValueGenerator}
        >
          {(cloudWords) =>
            cloudWords.map((w, i) => (
              <Text
                key={w.text}
                fill={colors[i % colors.length]}
                textAnchor={"middle"}
                transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                fontSize={w.size}
                fontFamily={w.font}
              >
                {w.text}
              </Text>
            ))
          }
        </Wordcloud>
        {showControls && (
          <div>
            <label>
              Spiral type &nbsp;
              <select
                onChange={(e) => setSpiralType(e.target.value as SpiralType)}
                value={spiralType}
              >
                <option key={"archimedean"} value={"archimedean"}>
                  archimedean
                </option>
                <option key={"rectangular"} value={"rectangular"}>
                  rectangular
                </option>
              </select>
            </label>
            <label>
              With rotation &nbsp;
              <input
                type="checkbox"
                checked={withRotation}
                onChange={() => setWithRotation(!withRotation)}
              />
            </label>
            <br />
          </div>
        )}
        <style>{`
          .wordcloud {
            display: flex;
            flex-direction: column;
            user-select: none;
          }
          .wordcloud svg {
            margin: 1rem 0;
            cursor: pointer;
          }

          .wordcloud label {
            display: inline-flex;
            align-items: center;
            font-size: 14px;
            margin-right: 8px;
          }
          .wordcloud textarea {
            min-height: 100px;
          }
        `}</style>
      </div>
    </div>
  );
};

// ... somewhere else, render it ...
// <BarGraph />

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
