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

function getWordFreq(words: Word[]) {
  return words.map(w => ({ text: w.text, value: w.timesSeen }))
}

export function WordCloud({ words, videoData, width = 800, height = 500 }: WordCloudProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  const wordFreqs = getWordFreq(words)
  const maxFreq = Math.max(...wordFreqs.map(w => w.value), 1)
  const minFreq = Math.min(...wordFreqs.map(w => w.value), 1)

  const fontScale = scaleLog({
    domain: [minFreq, maxFreq],
    range: [14, 72],
  })

  const selectedWordData = words.find(w => w.text === selectedWord)

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
              const freq = w.value ?? 1
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
        videoUrls={selectedWordData?.videoUrls ?? []}
        videoData={videoData}
        onClose={() => setSelectedWord(null)}
      />
    </>
  )
}
