import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import NavIcon from './NavIcon'

// Shared mobile off-canvas nav for both dashboard shells (HospitalPortalLayout,
// SuperAdminLayout) — below `md` their sidebars are hidden entirely and this
// slides in instead. Replaces the old behavior of squeezing the sidebar into
// a horizontal, wrapping bar of nav items under the header, which broke down
// once a role had more than 3-4 nav entries.
function MobileNavDrawer({ open, onClose, brand, navItems, footer }) {
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="animate-fade-in-up absolute inset-y-0 left-0 flex w-[82vw] max-w-xs flex-col overflow-y-auto border-r border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          {brand}
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-strong hover:text-heading"
          >
            <NavIcon name="close" className="h-4.5 w-4.5" />
          </button>
        </div>

        <nav className="mt-2 flex flex-1 flex-col gap-1 px-3 pb-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to.pathname || item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-600 shadow-sm shadow-indigo-500/5 ring-1 ring-indigo-500/25 ring-inset dark:text-indigo-300'
                    : 'text-muted hover:bg-card-strong hover:text-heading'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      isActive ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300' : 'text-faint group-hover:text-muted'
                    }`}
                  >
                    <NavIcon name={item.icon} className="h-4.5 w-4.5" />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {footer && <div className="border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export default MobileNavDrawer
