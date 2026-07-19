// Live mini mock-up of the hospital's public header + hero, driven directly
// by the in-progress form state — so a superadmin sees the effect of a
// color/logo/headline change before saving, instead of guessing and having
// to open the live site to check.
function BrandingPreview({ title, primaryColor, secondColor, bgImage, smallLogo, heroHeadline, heroSubtitle }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="flex items-center justify-between border-b border-line bg-surface px-3 py-2">
        <div className="flex items-center gap-2">
          {smallLogo ? (
            <img src={smallLogo} alt="" className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {(title || 'H').charAt(0).toUpperCase()}
            </span>
          )}
          <span className="text-xs font-semibold text-heading">{title || 'Hospital name'}</span>
        </div>
        <span
          className="rounded-md border px-2 py-0.5 text-[10px] font-medium"
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          Book Appointment
        </span>
      </div>

      <div
        className="relative flex min-h-32 items-center px-4 py-6"
        style={{
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: bgImage ? undefined : secondColor || '#0f172a',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: bgImage
              ? 'linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.75))'
              : `radial-gradient(ellipse 80% 60% at 20% 0%, color-mix(in srgb, ${primaryColor} 25%, transparent), transparent)`,
          }}
        />
        <div className="relative max-w-xs text-white">
          <p className="text-sm font-bold leading-snug">{heroHeadline || `Welcome to ${title || 'your hospital'}`}</p>
          <p className="mt-1 text-[11px] text-slate-300">
            {heroSubtitle || 'Quality healthcare, trusted specialists, and appointments that fit your life.'}
          </p>
          <span
            className="mt-3 inline-block rounded-md px-3 py-1 text-[10px] font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Book an Appointment
          </span>
        </div>
      </div>
    </div>
  )
}

export default BrandingPreview
