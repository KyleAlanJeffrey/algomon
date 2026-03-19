import Image from "next/image"
import { StatSlide } from "./stat-slide"
import type { Video } from "@/lib/types"

function getYouTubeThumbnail(url: string): string | null {
  try {
    const u = new URL(url)
    const v = u.searchParams.get("v")
    if (v) return `https://img.youtube.com/vi/${v}/maxresdefault.jpg`
    const parts = u.pathname.split("/")
    const idx = parts.indexOf("shorts")
    if (idx !== -1 && parts[idx + 1]) return `https://img.youtube.com/vi/${parts[idx + 1]}/maxresdefault.jpg`
  } catch {}
  return null
}

export function MostPushedSlide({ video, bg }: { video: Video | undefined; bg: string }) {
  const thumbnail = video ? getYouTubeThumbnail(video.url) : null

  return (
    <StatSlide bg={bg} decoration="rings-bl" label="YOUTUBE REALLY WANTS YOU TO WATCH THIS">
      {video ? (
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 block group max-w-xl mx-auto"
        >
          {thumbnail && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white/10 mb-5 shadow-2xl group-hover:scale-[1.02] transition-transform duration-300">
              <Image
                src={thumbnail}
                alt={video.title}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          <p className="text-white font-bold text-lg leading-snug mb-2">{video.title}</p>
          <p className="text-white/50 text-sm">
            Recommended to you <span className="text-white font-bold">{video.timesSeen}×</span>
          </p>
        </a>
      ) : (
        <p className="mt-8 text-white/40">No data yet.</p>
      )}
    </StatSlide>
  )
}
