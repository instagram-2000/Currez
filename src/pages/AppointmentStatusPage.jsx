import LanguageSwitcher from '../components/common/LanguageSwitcher'
import ThemeToggle from '../components/common/ThemeToggle'
import CheckStatusForm from '../components/hospital/CheckStatusForm'

// Standalone route for direct/shared links — same form as the popup
// triggered from the landing page, just presented as its own full-page card.
function AppointmentStatusPage({ slug }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-6 py-10 text-heading">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-xl">
        <div className="flex justify-end">
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
        <CheckStatusForm slug={slug} />
      </div>
    </div>
  )
}

export default AppointmentStatusPage
