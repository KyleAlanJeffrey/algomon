import Image from "next/image"
import { StatSlide } from "./stat-slide"

interface ChannelRow {
  channelName: string
  channelUrl: string | null
  channelAvatarUrl?: string | null
  videoCount: number
  totalSeen: number
  totalWatched: number
  totalWatchSeconds: number
}

export function TopChannelsSlide({ channels, gradient }: { channels: ChannelRow[]; gradient: { from: string; to: string } }) {
  return (
    <StatSlide
      gradient={gradient}
      label="YOUR TOP CHANNELS"
      stat={channels.length > 0 ? channels[0].channelName : undefined}
      subtext={channels.length > 0 ? `${channels[0].videoCount} videos recommended` : undefined}
    >
      {channels.length > 1 ? (
        <div className="mt-6 w-full max-w-2xl mx-auto space-y-2 max-h-[55vh] overflow-y-auto">
          {channels.slice(1, 15).map((ch, i) => (
            <a
              key={ch.channelName}
              href={ch.channelUrl ?? `https://www.youtube.com/results?search_query=${encodeURIComponent(ch.channelName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-white/30 font-mono text-sm w-6 text-right flex-shrink-0">{i + 2}</span>
              {ch.channelAvatarUrl ? (
                <div className="relative w-8 h-8 flex-shrink-0 rounded-full overflow-hidden bg-white/10">
                  <Image src={ch.channelAvatarUrl} alt="" fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white/30 text-xs font-bold">
                  {ch.channelName[0]}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm text-white/80 font-medium">{ch.channelName}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {ch.videoCount} videos · seen {ch.totalSeen}×
                </p>
              </div>
            </a>
          ))}
        </div>
      ) : channels.length === 0 ? (
        <p className="mt-8 text-white/40">No channel data yet — browse YouTube to start tracking.</p>
      ) : null}
    </StatSlide>
  )
}
