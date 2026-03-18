"use client"

import { useState } from "react"
import { VideoPanel } from "./video-panel"
import type { Word } from "@/lib/types"

interface WordCloudProps {
  words: Word[]
  videoData: Record<string, { title: string; imageUrl: string | null }>
}

function aggregateWords(words: Word[]) {
  const map = new Map<string, { value: number; videoUrls: string[] }>()
  for (const w of words) {
    const existing = map.get(w.text)
    if (existing) {
      existing.value += w.timesSeen
      for (const url of w.videoUrls) {
        if (!existing.videoUrls.includes(url)) existing.videoUrls.push(url)
      }
    } else {
      map.set(w.text, { value: w.timesSeen, videoUrls: [...w.videoUrls] })
    }
  }
  return map
}

export function WordCloud({ words, videoData }: WordCloudProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  const aggregated = aggregateWords(words)
  const wordFreqs = Array.from(aggregated.entries())
    .map(([text, { value, videoUrls }]) => ({ text, value, videoUrls }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 60)

  if (wordFreqs.length === 0) return null

  const maxFreq = wordFreqs[0].value
  const minFreq = wordFreqs[wordFreqs.length - 1].value

  function getFontSize(value: number) {
    const t = maxFreq === minFreq ? 1 : (value - minFreq) / (maxFreq - minFreq)
    return 11 + Math.pow(t, 0.5) * 46 // 11px to 57px
  }

  function getOpacity(value: number) {
    const t = maxFreq === minFreq ? 1 : (value - minFreq) / (maxFreq - minFreq)
    return 0.35 + t * 0.65
  }

  const selectedVideoUrls = selectedWord ? (aggregated.get(selectedWord)?.videoUrls ?? []) : []

  return (
    <>
      <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-3 px-8 max-w-4xl mx-auto">
        {wordFreqs.map(({ text, value }) => (
          <button
            key={text}
            onClick={() => setSelectedWord(text)}
            className="font-black leading-none transition-transform hover:scale-110"
            style={{
              fontSize: `${getFontSize(value)}px`,
              opacity: getOpacity(value),
              color: "white",
            }}
          >
            {text}
          </button>
        ))}
      </div>

      <VideoPanel
        word={selectedWord}
        videoUrls={selectedVideoUrls}
        videoData={videoData}
        onClose={() => setSelectedWord(null)}
      />
    </>
  )
}
