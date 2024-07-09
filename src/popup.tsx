import React, { useCallback, useEffect, useState } from "react";
import { Text } from "@visx/text";
import { scaleLog } from "@visx/scale";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud";

import { createRoot } from "react-dom/client";
import { blacklistWords, getTodayString } from "./helpers";
import { Video } from "./db";

export interface WordData {
  text: string;
  value: number;
}

const colors = ["#143059", "#2F6B9A", "#82a6c2"];
function wordFreq(text: string): [WordData[], number] {
  let maxFreq = 0;
  const words: string[] = text.replace(/\./g, "").split(/\s/);
  const freqMap: Record<string, number> = {};

  for (const w of words) {
    if (!freqMap[w]) freqMap[w] = 0;
    freqMap[w] += 1;
    if (freqMap[w] > maxFreq) maxFreq = freqMap[w];
  }
  const wordData = Object.keys(freqMap).map((word) => ({
    text: word,
    value: freqMap[word],
  }));
  return [wordData, maxFreq];
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
  const [words, setWords] = useState<WordData[]>([]);
  const [maxFreq, setMaxFreq] = useState(0);

  useEffect(() => {
    (async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      if (!tab.id) {
        return;
      }
      const response = await chrome.tabs.sendMessage(
        tab.id,
        {
          action: "getVideos",
        },
        (response) => {
          console.log(response);
          const videos = response as Video[];
          if (videos) {
            const allTitles = videos.map((v) => v.title);
            setTitles(allTitles);
            const allText = allTitles.join(" ");
            const [allWords, maxFreq] = wordFreq(allText);
            setMaxFreq(maxFreq);
            const filteredWords = allWords.filter(
              (word) => !blacklistWords.includes(word.text.toLowerCase())
            );
            console.log(filteredWords);
            setWords(filteredWords);
          }
        }
      );
    })();
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
      }}
    >
      <h1>Word Cloud</h1>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h4>Total Titles: {titles.length}</h4>
        <h4> | </h4>
        <h4>Max Freq: {maxFreq}</h4>
      </div>
      <div className="wordcloud">
        <Wordcloud
          words={words}
          width={500}
          height={400}
          fontSize={(datum: WordData) =>
            scaleLog({
              domain: [
                Math.min(...words.map((w) => w.value)),
                Math.max(...words.map((w) => w.value)),
              ],
              range: [10, maxFreq],
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

root.render(<Popup />);
