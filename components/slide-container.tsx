"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { DotNav } from "./dot-nav"

interface SlideContainerProps {
  slides: React.ReactNode[]
}

export function SlideContainer({ slides }: SlideContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  const scrollToSlide = useCallback((index: number) => {
    containerRef.current?.scrollTo({
      left: index * window.innerWidth,
      behavior: "smooth",
    })
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      setCurrent(Math.round(el.scrollLeft / el.offsetWidth))
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        className="flex overflow-x-scroll snap-x snap-mandatory h-screen"
        style={{ scrollbarWidth: "none" }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="snap-start flex-shrink-0 w-screen overflow-y-auto">
            {slide}
          </div>
        ))}
      </div>
      <DotNav total={slides.length} current={current} onChange={scrollToSlide} />
    </>
  )
}
