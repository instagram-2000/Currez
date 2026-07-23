import { useEffect, useState } from 'react'
import { subscribeHospital } from '../firebase/hospitals'
import { subscribeActiveDoctors } from '../firebase/users'
import { useTheme } from '../contexts/ThemeContext'
import { useSeoMeta } from '../hooks/useSeoMeta'
import Spinner from '../components/common/Spinner'
import TenantNotFound from './TenantNotFound'
import EmergencyBar from '../components/hospital/EmergencyBar'
import Header from '../components/hospital/Header'
import HeroSection from '../components/hospital/HeroSection'
import SectionRenderer from '../components/hospital/SectionRenderer'
import ContactSection from '../components/hospital/ContactSection'
import BookAppointmentSection from '../components/hospital/BookAppointmentSection'
import Footer from '../components/hospital/Footer'
import MobileBookingBar from '../components/hospital/MobileBookingBar'
import BookAppointmentModal from '../components/hospital/BookAppointmentModal'
import CheckStatusModal from '../components/hospital/CheckStatusModal'

function HospitalLandingPage({ slug }) {
  const { theme } = useTheme()
  const [config, setConfig] = useState(undefined)
  const [doctors, setDoctors] = useState([])
  // Header/hero/footer trigger these instead of navigating away, so booking
  // and checking status feel instant — the /appointment and
  // /appointment-status routes still exist for direct/shared links.
  const [activeModal, setActiveModal] = useState(null) // 'book' | 'status' | null

  // Live listener, not a one-time cached fetch — a superadmin change (e.g.
  // toggling a content section on) shows up here immediately, including in
  // tabs already open, instead of waiting out a stale local cache.
  useEffect(() => subscribeHospital(slug, setConfig), [slug])
  useEffect(() => subscribeActiveDoctors(slug, setDoctors), [slug])

  const departmentNames = config?.optionals?.departments?.items?.map((d) => d.name).filter(Boolean) || []

  useSeoMeta({
    title: config?.title ? `${config.title} — Book an Appointment` : undefined,
    description:
      config?.hero?.subtitle ||
      (config?.title ? `Book an appointment online at ${config.title}. Quality healthcare, trusted specialists.` : undefined),
    image: config?.branding?.logos?.smallLogo,
    structuredData: config?.title
      ? {
          '@context': 'https://schema.org',
          '@type': 'Hospital',
          name: config.title,
          url: window.location.origin,
          ...(config.branding?.logos?.smallLogo && { image: config.branding.logos.smallLogo }),
          ...(config.footer?.phone && { telephone: config.footer.phone }),
          ...(config.footer?.address && { address: config.footer.address }),
          ...(departmentNames.length > 0 && { medicalSpecialty: departmentNames }),
        }
      : undefined,
  })

  if (config === undefined) return <Spinner />
  if (!config) return <TenantNotFound slug={slug} />

  // The hospital's own branding picks the dark-mode background (their
  // identity); light mode intentionally overrides it with a clean neutral
  // rather than trying to invert an arbitrary admin-picked color.
  return (
    <div
      className={
        theme === 'dark' ? 'tenant-site min-h-screen text-white' : 'tenant-site min-h-screen bg-page text-heading'
      }
      style={{
        '--tenant-primary': config.branding?.primaryColor || '#6366f1',
        '--tenant-secondary': config.branding?.secondColor || '#0f172a',
        backgroundColor: theme === 'dark' ? 'var(--tenant-secondary)' : undefined,
      }}
    >
      <EmergencyBar config={config} />
      <Header
        config={config}
        onBookClick={() => setActiveModal('book')}
        onStatusClick={() => setActiveModal('status')}
      />
      <HeroSection
        config={config}
        doctorCount={doctors.length}
        onBookClick={() => setActiveModal('book')}
        onStatusClick={() => setActiveModal('status')}
      />
      <SectionRenderer optionals={config.optionals} doctors={doctors} slug={slug} />
      <ContactSection config={config} />
      <BookAppointmentSection config={config} />
      <Footer config={config} onStatusClick={() => setActiveModal('status')} />

      {/* Bottom padding on mobile only, so the fixed booking bar never
          covers the last bit of footer content. */}
      <div className="h-20 sm:hidden" aria-hidden="true" />
      <MobileBookingBar
        config={config}
        onBookClick={() => setActiveModal('book')}
        onStatusClick={() => setActiveModal('status')}
      />

      {activeModal === 'book' && (
        <BookAppointmentModal
          slug={slug}
          onClose={() => setActiveModal(null)}
          onCheckStatus={() => setActiveModal('status')}
        />
      )}
      {activeModal === 'status' && <CheckStatusModal slug={slug} onClose={() => setActiveModal(null)} />}
    </div>
  )
}

export default HospitalLandingPage
