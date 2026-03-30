import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Algomon — YouTube Algorithm Tracker | Monitor What YouTube Recommends You",
  description:
    "A YouTube algorithm tracker that monitors and visualizes your recommendations over time. Track what YouTube's algorithm recommends you, analyze your filter bubble with word clouds and recommendation graphs, and see how your content diet changes day by day.",
  keywords: [
    "YouTube algorithm tracker",
    "YouTube algorithm monitor",
    "track YouTube algorithm",
    "YouTube recommendation tracker",
    "YouTube recommendations analyzer",
    "what does YouTube recommend me",
    "YouTube filter bubble tracker",
    "YouTube analytics tool",
    "algorithm transparency tool",
    "YouTube watch history analytics",
    "YouTube recommendation patterns",
    "monitor YouTube recommendations",
    "YouTube algorithm bias",
    "YouTube content diet",
    "YouTube algorithm visualization",
  ],
  openGraph: {
    title: "Algomon — YouTube Algorithm Tracker | Your Algorithm, Exposed",
    description:
      "Track and visualize what YouTube's algorithm recommends you. A YouTube algorithm tracker with word clouds, recommendation graphs, and daily analytics.",
    url: "https://algomon.app",
    siteName: "Algomon",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Algomon — YouTube Algorithm Tracker",
    description:
      "YouTube algorithm tracker. Monitor your recommendations, visualize your filter bubble, and see what YouTube thinks you want to watch.",
  },
  alternates: {
    canonical: "https://algomon.app",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Algomon — YouTube Algorithm Tracker",
  alternateName: "Algomon",
  url: "https://algomon.app",
  description:
    "A YouTube algorithm tracker that monitors and visualizes your recommendations over time. Track what YouTube's algorithm recommends you, analyze your filter bubble, and understand your content diet.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  featureList: [
    "YouTube algorithm tracking",
    "YouTube recommendation monitoring",
    "Word cloud analytics for YouTube",
    "Recommendation graph visualization",
    "Daily and monthly YouTube analytics",
    "Channel distribution analysis",
    "Watch time tracking",
    "Click-through tracking by source",
    "Filter bubble visualization",
  ],
  author: {
    "@type": "Person",
    name: "Kyle Jeffrey",
    url: "https://kylejeffrey.com",
  },
}

// SVG icon paths (heroicons outline style)
const icons = {
  eye: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  cloud: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
  graph: "M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z",
  calendar: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  cursor: "M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59",
  users: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  extension: "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z",
  chart: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
}

function Icon({ d, color = "text-red-400" }: { d: string; color?: string }) {
  return (
    <svg className={`w-5 h-5 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Dark charcoal base with dot grid */}
        <div className="absolute inset-0 bg-[#111]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }} />
        {/* Red wash from top */}
        <div className="absolute top-0 left-0 right-0 h-[60%]" style={{
          background: "radial-gradient(ellipse 90% 70% at 50% -20%, rgba(220,38,38,0.15) 0%, transparent 60%)",
        }} />
        {/* Fade to body color at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[250px] bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        <div className="absolute top-0 left-0 px-6 py-4 z-10">
          <span className="font-black text-sm tracking-widest text-white/60">ALGOMON</span>
        </div>

        <div className="text-center max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-7 border border-red-500/20 rounded-md bg-red-500/[0.08]">
            <svg width="16" height="12" viewBox="10 30 108 68" fill="none">
              <rect x="10" y="30" width="108" height="68" rx="16" fill="#FF0000" />
              <path d="M52 44 L52 84 L88 64 Z" fill="white" />
            </svg>
            <span className="text-xs font-medium tracking-wide text-red-400">Algorithm Tracker</span>
          </div>

          <h1
            className="font-black text-white tracking-tight mb-5"
            style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)", lineHeight: 1.1 }}
          >
            See what <span className="text-red-500">YouTube</span> thinks you want.
          </h1>

          <p className="text-white/55 text-base sm:text-lg max-w-md mx-auto mb-9 leading-relaxed">
            A Chrome extension that tracks every video YouTube recommends you.
            Word clouds, recommendation graphs, watch analytics — your algorithm made visible.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/app"
              className="group px-7 py-3.5 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-500 transition-colors inline-flex items-center gap-2 justify-center"
            >
              Open Dashboard
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="px-7 py-3.5 border border-white/10 text-white/70 font-semibold text-sm rounded-lg hover:bg-white/5 hover:text-white/90 transition-colors"
            >
              How It Works
            </a>
          </div>

          {/* Quick stats strip */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mt-16 text-white/30 text-xs">
            <div className="flex items-center gap-1.5">
              <Icon d={icons.eye} color="text-white/20" />
              <span>Tracks home, sidebar & shorts</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Icon d={icons.extension} color="text-white/20" />
              <span>Chrome extension</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon d={icons.chart} color="text-white/20" />
              <span>Visual analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 border-t border-white/[0.08] bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-12">
            How the YouTube Algorithm Tracker Works
          </h2>

          <div className="grid gap-8">
            {[
              {
                step: "1",
                icon: icons.extension,
                title: "Install the extension",
                description:
                  "A Chrome extension runs in the background while you browse YouTube, capturing every recommendation the algorithm serves.",
              },
              {
                step: "2",
                icon: icons.eye,
                title: "Use YouTube normally",
                description:
                  "The extension records what appears on your home feed, sidebar, and Shorts. No behavior changes needed.",
              },
              {
                step: "3",
                icon: icons.chart,
                title: "See the patterns",
                description:
                  "The dashboard shows word clouds, recommendation graphs, channel breakdowns, and daily analytics of your YouTube diet.",
              },
            ].map(({ step, icon, title, description }) => (
              <div key={step} className="flex gap-4 items-start p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/10 shrink-0">
                  <Icon d={icon} />
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-red-400/60 uppercase tracking-widest">Step {step}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{title}</h3>
                  <p className="text-white/50 leading-relaxed text-[15px]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-white/[0.08]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
            YouTube Algorithm Analytics
          </h2>
          <p className="text-white/50 max-w-lg mb-12 text-[15px]">
            Tools to track and understand the invisible forces shaping your YouTube content diet.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: icons.eye,
                title: "Recommendation Tracking",
                description: "Captures every video YouTube recommends — home feed, sidebar, and Shorts — building a complete picture over time.",
              },
              {
                icon: icons.cloud,
                title: "Word Cloud",
                description: "See which words dominate your recommendations. Track trending topics and spot shifts in what YouTube thinks you want.",
              },
              {
                icon: icons.graph,
                title: "Recommendation Graph",
                description: "Visualize how videos connect. See which videos lead to which, and where your rabbit holes begin.",
              },
              {
                icon: icons.calendar,
                title: "Daily Analytics",
                description: "Spotify Wrapped-style breakdowns of your YouTube diet — daily snapshots, most-seen channels, top recurring videos.",
              },
              {
                icon: icons.cursor,
                title: "Click Tracking",
                description: "See which videos you actually click, from where (home vs sidebar), and at what position in the feed.",
              },
              {
                icon: icons.users,
                title: "Channel Insights",
                description: "Discover which channels YouTube pushes hardest. See frequency distributions and how your channel mix evolves.",
              },
            ].map(({ icon, title, description }) => (
              <div key={title} className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
                  <Icon d={icon} />
                </div>
                <h3 className="font-semibold text-white mb-1.5 text-[15px]">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-white/[0.08] bg-[#0d0d0d]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 mb-6">
            <svg width="28" height="20" viewBox="10 30 108 68" fill="none">
              <rect x="10" y="30" width="108" height="68" rx="16" fill="#FF0000" />
              <path d="M52 44 L52 84 L88 64 Z" fill="white" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Start Tracking Your YouTube Algorithm
          </h2>
          <p className="text-white/50 mb-8 text-[15px]">
            Your data stays yours.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-500 transition-colors"
          >
            Open Dashboard
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/[0.08] text-center text-xs text-white/25">
        Algomon — YouTube Algorithm Tracker
      </footer>
    </>
  )
}
