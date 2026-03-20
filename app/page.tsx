import type { Metadata } from "next"
import Link from "next/link"
import { LandingAnimations } from "@/components/landing-animations"

export const metadata: Metadata = {
  title: "Algomon — YouTube Algorithm Monitor | See What YouTube Recommends You",
  description:
    "Track, analyze, and visualize your YouTube recommendations over time. Algomon reveals your filter bubble — see trending words, recommendation patterns, watch habits, and how YouTube's algorithm shapes what you see.",
  keywords: [
    "YouTube algorithm",
    "YouTube recommendations",
    "algorithm monitor",
    "filter bubble",
    "recommendation tracker",
    "YouTube analytics",
    "algorithm transparency",
    "YouTube watch history",
    "content recommendations",
    "algorithm bias",
  ],
  openGraph: {
    title: "Algomon — Your YouTube Algorithm, Exposed",
    description:
      "Track and visualize what YouTube recommends you. Discover patterns in your filter bubble with word clouds, recommendation graphs, and daily analytics.",
    url: "https://algomon.kylejeffrey.com",
    siteName: "Algomon",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Algomon — Your YouTube Algorithm, Exposed",
    description:
      "Track and visualize what YouTube recommends you. Discover patterns in your filter bubble.",
  },
  alternates: {
    canonical: "https://algomon.kylejeffrey.com",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Algomon",
  url: "https://algomon.kylejeffrey.com",
  description:
    "Track, analyze, and visualize your YouTube recommendations over time. Algomon reveals your filter bubble.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "YouTube recommendation tracking",
    "Word frequency analysis",
    "Recommendation graph visualization",
    "Daily analytics dashboard",
    "Channel distribution analysis",
    "Watch time tracking",
  ],
}

const features = [
  {
    title: "Recommendation Tracking",
    description:
      "A Chrome extension silently captures every video YouTube recommends — on your home feed, sidebar, and Shorts — building a complete picture over days, weeks, and months.",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  },
  {
    title: "Word Cloud Analytics",
    description:
      "See which words dominate your recommendations. Track trending topics, discover recurring themes, and spot shifts in what YouTube thinks you want to watch.",
    icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
  },
  {
    title: "Recommendation Graph",
    description:
      "Visualize how videos connect to each other. See the web of recommendations YouTube builds — which videos lead to which, and where your rabbit holes begin.",
    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  },
  {
    title: "Daily & Monthly Wraps",
    description:
      "Get a Spotify Wrapped-style breakdown of your YouTube diet — daily snapshots, monthly summaries, most-seen channels, and top recurring videos.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    title: "Channel Insights",
    description:
      "Discover which channels YouTube pushes hardest. See channel frequency distributions, avatar galleries, and how your channel mix evolves over time.",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    title: "Filter Bubble Awareness",
    description:
      "Understand the invisible walls around your content diet. Algomon makes the algorithm legible so you can make conscious choices about what you consume.",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
]

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(139,92,246,0.15) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(29,185,84,0.1) 0%, transparent 60%)",
          }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

        <LandingAnimations>
          <div className="text-center max-w-3xl relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-400/70 mb-6">
              YouTube Algorithm Monitor
            </p>

            <h1
              className="font-black text-white leading-[0.9] tracking-tighter mb-6"
              style={{ fontSize: "clamp(2.5rem, 10vw, 6rem)" }}
            >
              Your Algorithm,{" "}
              <span className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Exposed.
              </span>
            </h1>

            <p className="text-white/50 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
              Track every video YouTube recommends you. Visualize your filter
              bubble with word clouds, recommendation graphs, and daily
              analytics.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/app"
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm tracking-wide rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105"
              >
                Open Dashboard
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 border border-white/15 text-white/70 font-bold text-sm tracking-wide rounded-full hover:bg-white/5 hover:text-white transition-colors"
              >
                How It Works
              </a>
            </div>
          </div>
        </LandingAnimations>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <svg
            className="w-4 h-4 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-center mb-4">
            How It Works
          </h2>
          <p className="text-white/40 text-center max-w-lg mx-auto mb-16">
            Three simple steps to start understanding your YouTube algorithm.
          </p>

          <div className="grid gap-8 sm:gap-12">
            {[
              {
                step: "01",
                title: "Install the Chrome Extension",
                description:
                  "A lightweight extension runs in the background while you browse YouTube, capturing every recommendation the algorithm serves you.",
              },
              {
                step: "02",
                title: "Browse YouTube Normally",
                description:
                  "Just use YouTube like you always do. The extension silently records what appears on your home feed, sidebar recommendations, and Shorts.",
              },
              {
                step: "03",
                title: "Explore Your Data",
                description:
                  "Open the Algomon dashboard to see word clouds, recommendation graphs, channel breakdowns, daily analytics, and monthly wraps of your YouTube diet.",
              },
            ].map(({ step, title, description }) => (
              <div key={step} className="flex gap-6 items-start">
                <span className="text-3xl font-black text-purple-500/30 shrink-0 font-mono">
                  {step}
                </span>
                <div>
                  <h3 className="text-lg font-bold mb-1">{title}</h3>
                  <p className="text-white/40 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-center mb-4">
            See What Others Can&apos;t
          </h2>
          <p className="text-white/40 text-center max-w-lg mx-auto mb-16">
            Algomon gives you tools to understand the invisible forces shaping
            your content diet.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ title, description, icon }) => (
              <article
                key={title}
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={icon}
                    />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
            Ready to See Your Algorithm?
          </h2>
          <p className="text-white/40 mb-8">
            Free and open source. Your data stays yours.
          </p>
          <Link
            href="/app"
            className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm tracking-wide rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105"
          >
            Open Dashboard &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-xs text-white/20">
        <p>
          Algomon &mdash; YouTube Algorithm Monitor.{" "}
          <span className="hidden sm:inline">
            Built to make the algorithm legible.
          </span>
        </p>
      </footer>
    </>
  )
}
