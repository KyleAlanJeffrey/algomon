"use client"

interface DotNavProps {
  total: number
  current: number
  onChange: (index: number) => void
}

export function DotNav({ total, current, onChange }: DotNavProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? "w-6 h-2 bg-white"
              : "w-2 h-2 bg-white/40 hover:bg-white/60"
          }`}
        />
      ))}
    </div>
  )
}
