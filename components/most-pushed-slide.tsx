import Image from "next/image"
import { StatSlide } from "./stat-slide"
import { ScrollableList } from "./scrollable-list"
import type { Video } from "@/lib/types"

function getYouTubeThumbnail(url: string, quality: "maxresdefault" | "mqdefault" = "maxresdefault"): string | null {
  try {
    const u = new URL(url)
    const v = u.searchParams.get("v")
    if (v) return `https://img.youtube.com/vi/${v}/${quality}.jpg`
    const parts = u.pathname.split("/")
    const idx = parts.indexOf("shorts")
    if (idx !== -1 && parts[idx + 1]) return `https://img.youtube.com/vi/${parts[idx + 1]}/${quality}.jpg`
  } catch {}
  return null
}

export function MostPushedSlide({ videos, gradient }: { videos: Video[]; gradient: { from: string; to: string } }) {
  const top = videos[0]
  const thumbnail = top ? getYouTubeThumbnail(top.url) : null

  return (
    <StatSlide gradient={gradient} label="YOUTUBE REALLY WANTS YOU TO SEE">
      {top ? (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center">
          <a
            href={top.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group mb-2 w-full"
          >
            {thumbnail && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white/10 mb-3 shadow-2xl group-hover:scale-[1.02] transition-transform duration-300">
                <Image src={thumbnail} alt={top.title} fill className="object-cover" unoptimized />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            <p className="text-white font-bold text-base leading-snug mb-1 text-center">{top.title}</p>
            <p className="text-white/50 text-sm text-center">
              Recommended to you <span className="text-white font-bold">{top.timesSeen}×</span>
            </p>
          </a>

          {videos.length > 1 && (
            <ScrollableList buttonLabel={`View all ${videos.length} videos`}>
              <div className="space-y-2">
                {videos.map((v, i) => {
                  const thumb = getYouTubeThumbnail(v.url, "mqdefault")
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
                        <p className="text-xs text-white/40 mt-0.5">seen {v.timesSeen}×</p>
                      </div>
                    </a>
                  )
                })}
              </div>
            </ScrollableList>
          )}
        </div>
      ) : (
        <p className="mt-8 text-white/40">No data yet.</p>
      )}
    </StatSlide>
  )
}
