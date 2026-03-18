"use client"

import { useState, useCallback } from "react"
import { Text } from "@visx/text"
import { scaleLog } from "@visx/scale"
import Wordcloud from "@visx/wordcloud/lib/Wordcloud"
import { VideoPanel } from "./video-panel"
import type { Word } from "@/lib/types"

interface WordCloudProps {
  words: Word[]
  videoData: Record<string, { title: string; imageUrl: string | null }>
  width?: number
  height?: number
}

// Deduplicate words across dates, summing frequencies and merging video URLs
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

export function WordCloud({ words, videoData, width = 800, height = 500 }: WordCloudProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  const aggregated = aggregateWords(words)
  const wordFreqs = Array.from(aggregated.entries()).map(([text, { value }]) => ({ text, value }))
  const maxFreq = Math.max(...wordFreqs.map(w => w.value), 1)
  const minFreq = Math.min(...wordFreqs.map(w => w.value), 1)

  const fontScale = scaleLog({
    domain: [minFreq, maxFreq],
    range: [14, 72],
  })

  const selectedVideoUrls = selectedWord ? (aggregated.get(selectedWord)?.videoUrls ?? []) : []

  const handleWordClick = useCallback((word: { text: string }) => {
    setSelectedWord(word.text)
  }, [])

  return (
    <>
      <div className="cursor-pointer select-none">
        <Wordcloud
          words={wordFreqs}
          width={width}
          height={height}
          fontSize={w => fontScale(w.value)}
          font="var(--font-geist-sans)"
          padding={3}
          rotate={0}
          spiral="rectangular"
        >
          {cloudWords =>
            cloudWords.map(w => {
              const freq = w.size ?? 1
              const normalizedBrightness = (freq - minFreq) / (maxFreq - minFreq || 1)
              const opacity = 0.4 + normalizedBrightness * 0.6

              return (
                <Text
                  key={w.text}
                  fill="white"
                  fillOpacity={opacity}
                  textAnchor="middle"
                  transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                  fontSize={w.size}
                  fontFamily={w.font}
                  fontWeight={900}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => handleWordClick({ text: w.text! })}
                >
                  {w.text}
                </Text>
              )
            })
          }
        </Wordcloud>
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
