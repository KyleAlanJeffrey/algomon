import Image from "next/image"
import type { Video } from "@/lib/types"

function getYouTubeThumbnail(url: string): string | null {
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

export function TopVideos({ videos }: { videos: Video[] }) {
  return (
    <div className="mt-6 w-full max-w-2xl mx-auto space-y-2">
      {videos.map((v, i) => {
        const thumbnail = getYouTubeThumbnail(v.url)
        return (
          <a
            key={v.url}
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="text-white/30 font-mono text-sm w-6 text-right flex-shrink-0">{i + 1}</span>
            {thumbnail && (
              <div className="relative w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
                <Image src={thumbnail} alt={v.title} fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm text-white/80 font-medium line-clamp-2">{v.title}</p>
              <p className="text-xs text-white/40 mt-0.5">seen {v.timesSeen}&times;</p>
            </div>
          </a>
        )
      })}
    </div>
  )
}
