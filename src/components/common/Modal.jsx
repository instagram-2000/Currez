import { useEffect } from 'react'
import NavIcon from './NavIcon'

// Generic backdrop + centered card shell — closes on Escape or a backdrop
// click, and owns the fade/scale-in so every popup (booking, status check,
// etc.) opens and closes the same way instead of each screen re-inventing it.
function Modal({ children, onClose, className = 'max-w-md' }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`animate-fade-in-up relative w-full rounded-2xl border border-line bg-surface p-8 shadow-xl ${className}`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-card-strong hover:text-heading"
        >
          <NavIcon name="close" className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal
