import { useState } from 'react'
import Reveal from '../components/common/Reveal'
import ThemeToggle from '../components/common/ThemeToggle'

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#dashboard', label: 'Dashboard' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
]

const STATS = [
  { label: 'Hospitals Onboarded', value: '120+' },
  { label: 'Doctors Connected', value: '3,400+' },
  { label: 'Appointments Booked Daily', value: '18,000+' },
  { label: 'Support & Monitoring', value: '24/7' },
]

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Branded hospital sites',
    body: "Each hospital gets its own subdomain with its logo, services, doctors and testimonials — live in minutes.",
  },
  {
    n: '02',
    title: 'Patient self-booking',
    body: 'Patients book directly from the hospital’s page, no login required, and get an instant token to track their visit.',
  },
  {
    n: '03',
    title: 'Front-desk confirmation',
    body: "Reception confirms each booking on arrival and records how the visit fee was paid — cash or the hospital's own QR.",
  },
  {
    n: '04',
    title: 'Role-based dashboards',
    body: 'Hospital admins, doctors and receptionists each get a focused dashboard scoped to exactly what they need.',
  },
]

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: '₹15k',
    period: '/mo',
    tagline: 'For single-facility clinics & nursing homes. Up to 50 beds.',
    features: ['Patient records & OPD scheduling', 'Billing & invoicing', 'Email support'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '₹42k',
    period: '/mo',
    tagline: 'For multi-department hospitals. Up to 250 beds.',
    features: ['Everything in Starter', 'Multi-doctor scheduling', 'Priority support'],
    cta: 'Book a demo',
    highlighted: true,
  },
  {
    name: 'Custom',
    price: null,
    period: '',
    tagline: 'For hospital groups & chains. Unlimited beds & sites.',
    features: ['Everything in Growth', 'Multi-hospital management', 'Dedicated success manager'],
    cta: 'Talk to sales',
    highlighted: false,
  },
]

const MAILTO = 'mailto:sales@medidesk.com'

// Centers section content and keeps generous side margins on wide screens —
// the full-bleed colored bands (stats/CTA) stay on the outer <section>.
const CONTAINER = 'mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 xl:px-24'

function CompanyLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-page text-heading">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-line bg-page/80 backdrop-blur">
        <div className={`flex items-center justify-between py-4 ${CONTAINER}`}>
          <span className="text-lg font-semibold">MediDesk</span>

          <nav className="hidden items-center gap-8 text-sm text-body md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-heading">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <a
              href={MAILTO}
              className="hidden rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 sm:inline-block"
            >
              Book a demo
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="cursor-pointer rounded-lg p-2 text-body transition-colors hover:bg-card-strong md:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="animate-fade-in-up border-t border-line px-6 py-4 md:hidden">
            <nav className="flex flex-col gap-4 text-sm text-body">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="hover:text-heading">
                  {link.label}
                </a>
              ))}
              <a href={MAILTO} className="rounded-full bg-indigo-600 px-4 py-2 text-center font-medium text-white">
                Book a demo
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className={`pb-16 pt-16 md:pb-24 md:pt-24 ${CONTAINER}`}>
        <h1 className="max-w-2xl animate-fade-in-up text-4xl font-bold leading-tight md:text-5xl">
          Every hospital appointment,
          <br />
          handled in one place.
        </h1>
        <p
          className="mt-5 max-w-xl animate-fade-in-up text-base text-body md:text-lg"
          style={{ animationDelay: '120ms' }}
        >
          MediDesk gives each hospital its own branded booking site, patient self-service booking, and
          role-based dashboards for admins, doctors and receptionists — live in minutes.
        </p>
        <div
          className="mt-8 flex animate-fade-in-up flex-wrap items-center gap-4"
          style={{ animationDelay: '240ms' }}
        >
          <a
            href={MAILTO}
            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Get Your Hospital Onboarded
          </a>
          <a href="#features" className="text-sm font-medium text-body transition-colors hover:text-heading">
            See features &rarr;
          </a>
        </div>
      </section>

      {/* Stats band */}
      <Reveal as="section" className="bg-indigo-600 py-10">
        <div className={`grid grid-cols-2 gap-8 text-center sm:grid-cols-4 ${CONTAINER}`}>
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-white md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-indigo-100 md:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* How it works */}
      <section id="features" className={`py-20 ${CONTAINER}`}>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">How MediDesk works</p>
        </Reveal>
        <div className="mt-8 divide-y divide-line border-t border-line">
          {HOW_IT_WORKS.map((step, i) => (
            <Reveal
              key={step.n}
              delay={i * 80}
              className="grid grid-cols-[3rem_1fr] gap-4 py-6 sm:grid-cols-[5rem_1fr] sm:gap-6"
            >
              <span className="font-mono text-sm text-indigo-500">{step.n}</span>
              <div>
                <h3 className="font-semibold text-heading">{step.title}</h3>
                <p className="mt-1 max-w-xl text-sm text-body">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Command center / dashboard preview */}
      <section id="dashboard" className={`py-20 ${CONTAINER}`}>
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Command center</p>
            <h2 className="mt-3 text-3xl font-bold">Every department, one dashboard.</h2>
            <p className="mt-4 max-w-md text-body">
              Hospital admins see appointments, patients and staff at a glance. Doctors see only their own
              schedule and confirmed visits. Receptionists book, confirm and search — nothing more, nothing
              less.
            </p>
          </Reveal>

          <Reveal delay={120} className="rounded-2xl border border-line bg-card p-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Today's Appointments", value: '24' },
                { label: 'Doctors', value: '9' },
                { label: 'Patients', value: '312' },
              ].map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-xl border border-line bg-page p-3 transition-colors hover:border-line-strong"
                >
                  <p className="text-lg font-bold text-heading">{tile.value}</p>
                  <p className="mt-1 text-[11px] text-faint">{tile.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {[
                { name: 'Priya Sharma', meta: 'Dr. Mehta · 10:30 AM', status: 'Confirmed' },
                { name: 'Arjun Nair', meta: 'Dr. Iyer · 11:00 AM', status: 'Pending' },
                { name: 'Kavya Reddy', meta: 'Dr. Mehta · 11:15 AM', status: 'Confirmed' },
              ].map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm transition-colors hover:border-line-strong"
                >
                  <div>
                    <p className="text-heading">{row.name}</p>
                    <p className="text-xs text-faint">{row.meta}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      row.status === 'Confirmed'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}
                  >
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={`py-20 ${CONTAINER}`}>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold">Simple, hospital-sized plans</h2>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PRICING_TIERS.map((tier, i) => (
            <Reveal
              key={tier.name}
              delay={i * 100}
              className={`relative rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 ${
                tier.highlighted ? 'border-indigo-500 bg-card' : 'border-line hover:border-line-strong'
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 right-6 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white">
                  Most popular
                </span>
              )}
              <p className="text-xs font-semibold uppercase tracking-wide text-faint">{tier.name}</p>
              <p className="mt-2 text-3xl font-bold">
                {tier.price || 'Custom'}
                {tier.period && <span className="text-base font-normal text-faint">{tier.period}</span>}
              </p>
              <p className="mt-2 text-sm text-body">{tier.tagline}</p>
              <ul className="mt-5 space-y-2 text-sm text-body">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 text-indigo-500">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={MAILTO}
                className={`mt-6 block rounded-full px-4 py-2 text-center text-sm font-medium transition-colors ${
                  tier.highlighted
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                    : 'border border-line-strong text-heading hover:bg-card-strong'
                }`}
              >
                {tier.cta}
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <Reveal as="section" className="border-t border-line py-20 text-center">
        <div className={CONTAINER}>
          <p className="mx-auto max-w-2xl text-xl font-medium text-heading md:text-2xl">
            "Patients book themselves and reception just confirms and goes — our front desk workload dropped
            almost overnight."
          </p>
          <p className="mt-4 text-sm text-faint">— Hospital Operations Team, MediDesk partner hospital</p>
        </div>
      </Reveal>

      {/* Final CTA */}
      <Reveal as="section" id="contact" className="border-t border-line bg-card py-20 text-center">
        <div className={CONTAINER}>
          <h2 className="text-3xl font-bold">Ready to move your hospital onto MediDesk?</h2>
          <p className="mx-auto mt-3 max-w-md text-body">
            Reach out and we'll get your hospital's branded booking site live in minutes.
          </p>
          <a
            href={MAILTO}
            className="mt-8 inline-block rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Get Your Hospital Onboarded
          </a>
        </div>
      </Reveal>

      {/* Footer */}
      <footer className={`flex flex-col items-center justify-between gap-4 py-8 text-xs text-faint sm:flex-row ${CONTAINER}`}>
        <p>© {new Date().getFullYear()} MediDesk Technologies. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-6">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-body">
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}

export default CompanyLandingPage
