import Image from "next/image"
import { StatSlide } from "./stat-slide"
import { ScrollableList } from "./scrollable-list"
import type { Video } from "@/lib/types"

function getThumb(url: string): string | null {
  try {
    const u = new URL(url)
    const v = u.searchParams.get("v")
    if (v) return `https://img.youtube.com/vi/${v}/mqdefault.jpg`
    const parts = u.pathname.split("/")
    const idx = parts.indexOf("shorts")
    if (idx !== -1 && parts[idx + 1]) return `https://img.youtube.com/vi/${parts[idx + 1]}/mqdefault.jpg`
  } catch {}
  return null
}

function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`
}

export function MostWatchedSlide({ videos, gradient }: { videos: Video[]; gradient: { from: string; to: string } }) {
  const watched = [...videos]
    .filter(v => v.timesWatched > 0)
    .sort((a, b) => b.watchSeconds - a.watchSeconds)
    .slice(0, 10)

  const totalSeconds = watched.reduce((s, v) => s + v.watchSeconds, 0)

  return (
    <StatSlide
      gradient={gradient}
      label="WHAT YOU ACTUALLY WATCHED"
      stat={totalSeconds > 0 ? formatTime(totalSeconds) : undefined}
      subtext={totalSeconds > 0 ? `across ${watched.length} videos` : undefined}
    >
      {watched.length > 0 ? (
        <ScrollableList buttonLabel={`View all ${watched.length} videos`}>
          <div className="space-y-2">
            {watched.map((v, i) => {
              const thumb = getThumb(v.url)
              return (
                <a
                  key={v.url}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
                >
                  <span className="text-white/30 font-mono text-sm w-6 text-right flex-shrink-0">{i + 1}</span>
                  {thumb && (
                    <div className="relative w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
                      <Image src={thumb} alt={v.title} fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm text-white/90 font-medium line-clamp-2">{v.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      <span className="text-[#10B981] font-bold">{formatTime(v.watchSeconds)}</span>
                      {v.timesWatched > 1 && <span> · {v.timesWatched}× played</span>}
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        </ScrollableList>
      ) : (
        <p className="mt-8 text-white/40">No watch data yet — browse YouTube to start tracking.</p>
      )}
    </StatSlide>
  )
}
