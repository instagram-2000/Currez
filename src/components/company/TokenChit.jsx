import { useEffect, useState } from 'react'

const LIVE_TOKENS = [
  { code: 'APT-BK42-NP7R', hospital: "St. Xavier's Multispecialty", detail: 'Dr. Mehta · OPD 3', slug: 'stxaviers' },
  { code: 'APT-M2X8-QH5V', hospital: "Sunrise Children's Hospital", detail: 'Dr. Iyer · OPD 1', slug: 'sunrise' },
  { code: 'APT-R9WN-4KJ6', hospital: 'Lakeview General Hospital', detail: 'Dr. Nair · OPD 2', slug: 'lakeview' },
]

// Hero signature piece, styled after the physical queue-token slip a
// patient gets at the front desk (see "instant token" in the hero copy).
// Cycles through sample hospitals to suggest many branded sites running
// live at once, rather than a static dashboard screenshot.
function TokenChit() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setIndex((v) => (v + 1) % LIVE_TOKENS.length), 3400)
    return () => clearInterval(id)
  }, [])

  const token = LIVE_TOKENS[index]

  return (
    <div className="relative mx-auto w-full max-w-sm -rotate-2 rounded-2xl border border-paper-line bg-paper px-7 pb-7 pt-9 text-ink shadow-2xl shadow-black/15 transition-transform duration-500 ease-out hover:rotate-0">
      <div className="absolute inset-x-7 top-0 flex -translate-y-1/2 justify-between" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="h-3 w-3 rounded-full bg-page" />
        ))}
      </div>

      <p className="flex items-center gap-2 font-plex-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
        Live token
      </p>

      <p className="mt-4 font-plex-mono text-5xl font-semibold tracking-wider tabular-nums">{token.code}</p>

      <div className="mt-5 border-t border-dashed border-paper-line pt-4">
        <p className="font-plex text-sm font-semibold">{token.hospital}</p>
        <p className="mt-0.5 font-plex-mono text-xs text-ink/60">{token.detail}</p>
      </div>

      <p className="mt-5 font-plex-mono text-[10px] tracking-wide text-ink/40">
        currez.app/{token.slug}
      </p>
    </div>
  )
}

export default TokenChit
