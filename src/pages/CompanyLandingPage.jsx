import { useState } from "react";
import Reveal from "../components/common/Reveal";
import ThemeToggle from "../components/common/ThemeToggle";
import TokenChit from "../components/company/TokenChit";
import LeadCaptureModal from "../components/company/LeadCaptureModal";

const LEAD_MODALS = {
  demo: {
    title: "Book a demo",
    subtitle: "See Currez running for a hospital like yours — pick a time and we'll set it up.",
    intent: "Book a Demo",
  },
  onboard: {
    title: "Get your hospital onboarded",
    subtitle: "Tell us a bit about your hospital and we'll get your branded booking site live.",
    intent: "Get Your Hospital Onboarded",
  },
  sales: {
    title: "Talk to sales",
    subtitle: "Hospital groups & chains — let's figure out a plan that fits. We'll reach out shortly.",
    intent: "Talk to Sales — Custom Plan",
  },
  contact: {
    title: "Get in touch",
    subtitle: "Questions, feedback, anything at all — leave your details and we'll get back to you soon.",
    intent: "General Contact",
  },
}

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#dashboard", label: "Dashboard" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

const STATS = [
  { label: "Hospitals Onboarded", value: "120+" },
  { label: "Doctors Connected", value: "3,400+" },
  { label: "Appointments Booked Daily", value: "18,000+" },
  { label: "Support & Monitoring", value: "24/7" },
];

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Branded hospital sites",
    body: "Each hospital gets its own subdomain with its logo, services, doctors and testimonials — live in minutes.",
  },
  {
    n: "02",
    title: "Patient self-booking",
    body: "Patients book directly from the hospital’s page, no login required, and get an instant token to track their visit.",
  },
  {
    n: "03",
    title: "Front-desk confirmation",
    body: "Reception confirms each booking on arrival and records how the visit fee was paid — cash or the hospital's own QR.",
  },
  {
    n: "04",
    title: "Role-based dashboards",
    body: "Hospital admins, doctors and receptionists each get a focused dashboard scoped to exactly what they need.",
  },
];

// Custom sits in the middle and is the only plan actually offered right
// now — Starter/Growth pricing isn't finalized yet, so they're shown as a
// preview (marked "Coming soon") rather than something bookable.
const PRICING_TIERS = [
  {
    name: "Starter",
    price: "₹15k",
    period: "/mo",
    tagline: "For single-facility clinics & nursing homes. Up to 50 beds.",
    features: [
      "Patient records & OPD scheduling",
      "Billing & invoicing",
      "Email support",
    ],
    comingSoon: true,
  },
  {
    name: "Custom",
    price: null,
    period: "",
    tagline: "For hospital groups & chains. Unlimited beds & sites.",
    features: [
      "Everything in Growth",
      "Multi-hospital management",
      "Dedicated success manager",
    ],
    cta: "Talk to sales",
    highlighted: true,
  },
  {
    name: "Growth",
    price: "₹42k",
    period: "/mo",
    tagline: "For multi-department hospitals. Up to 250 beds.",
    features: [
      "Everything in Starter",
      "Multi-doctor scheduling",
      "Priority support",
    ],
    comingSoon: true,
  },
];

// Centers section content and keeps generous side margins on wide screens —
// the full-bleed colored bands (stats/CTA) stay on the outer <section>.
const CONTAINER = "mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 xl:px-24";

function CompanyLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  return (
    <div className="min-h-screen bg-page font-plex text-heading">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-line bg-page/85 backdrop-blur">
        <div className={`flex items-center justify-between py-4 ${CONTAINER}`}>
          <span className="flex items-center gap-2.5">
            <img src="/currez-mark.png" alt="Currez" className="h-8 w-8 rounded-md object-contain" />
            <span className="font-plex-mono text-base font-semibold tracking-[0.08em] text-heading">
              CURREZ
            </span>
          </span>

          <nav className="hidden items-center gap-8 text-xs md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-medium uppercase tracking-wide text-body transition-colors hover:text-heading"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              onClick={() => setActiveModal("demo")}
              className="hidden cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5 sm:inline-block"
            >
              Book a demo
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="cursor-pointer rounded-lg p-2 text-body transition-colors hover:bg-card-strong md:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="animate-fade-in-up border-t border-line px-6 py-4 md:hidden">
            <nav className="flex flex-col gap-4 text-sm text-body">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-heading"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => { setMenuOpen(false); setActiveModal("demo"); }}
                className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-center font-semibold text-ink"
              >
                Book a demo
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className={`grid gap-14 pb-20 pt-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:pb-28 md:pt-24 ${CONTAINER}`}>
        <div>
          <p className="animate-fade-in-up font-plex-mono text-xs uppercase tracking-[0.25em] text-accent">
            Hospital operations, digitized
          </p>
          <h1
            className="mt-4 max-w-xl animate-fade-in-up font-display text-4xl font-semibold leading-[1.05] md:text-6xl"
            style={{ animationDelay: "90ms" }}
          >
            Every hospital appointment,
            <br />
            handled <span className="italic text-accent">in one place</span>.
          </h1>
          <p
            className="mt-6 max-w-md animate-fade-in-up text-base text-body md:text-lg"
            style={{ animationDelay: "180ms" }}
          >
            Currez gives each hospital its own branded booking site, patient
            self-service booking, and role-based dashboards for admins, doctors
            and receptionists — live in minutes.
          </p>
          <div
            className="mt-8 flex animate-fade-in-up flex-wrap items-center gap-6"
            style={{ animationDelay: "280ms" }}
          >
            <button
              onClick={() => setActiveModal("onboard")}
              className="cursor-pointer rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/20"
            >
              Get Your Hospital Onboarded
            </button>
            <a
              href="#features"
              className="text-sm font-medium text-body transition-colors hover:text-heading"
            >
              See features &rarr;
            </a>
          </div>
        </div>

        <Reveal delay={200}>
          <TokenChit />
        </Reveal>
      </section>

      {/* Stats / ledger band */}
      <Reveal as="section" className="bg-ink py-12">
        <div
          className={`grid grid-cols-2 divide-y divide-white/10 sm:grid-cols-4 sm:divide-x sm:divide-y-0 ${CONTAINER}`}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="px-2 py-5 text-center sm:py-0">
              <p className="font-plex-mono text-2xl font-semibold text-accent-glow md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[11px] uppercase tracking-wide text-white/60 md:text-xs">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* How it works */}
      <section id="features" className={`py-24 ${CONTAINER}`}>
        <Reveal>
          <p className="font-plex-mono text-xs uppercase tracking-[0.25em] text-accent">
            How Currez works
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            Booking to confirmation, in four steps.
          </h2>
        </Reveal>
        <div className="mt-10 divide-y divide-line border-t border-line">
          {HOW_IT_WORKS.map((step, i) => (
            <Reveal
              key={step.n}
              delay={i * 80}
              className="grid grid-cols-[3.5rem_1fr] items-start gap-4 py-7 sm:grid-cols-[5rem_1fr] sm:gap-6"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-md border border-paper-line bg-paper font-plex-mono text-xs font-semibold text-ink ${
                  i % 2 === 0 ? "-rotate-2" : "rotate-2"
                }`}
              >
                {step.n}
              </span>
              <div>
                <h3 className="font-semibold text-heading">{step.title}</h3>
                <p className="mt-1.5 max-w-xl text-sm text-body">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Command center / dashboard preview */}
      <section id="dashboard" className={`py-24 ${CONTAINER}`}>
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Reveal>
            <p className="font-plex-mono text-xs uppercase tracking-[0.25em] text-accent">
              Command center
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">
              Every department, one dashboard.
            </h2>
            <p className="mt-4 max-w-md text-body">
              Hospital admins see appointments, patients and staff at a glance.
              Doctors see only their own schedule and confirmed visits.
              Receptionists book, confirm and search — nothing more, nothing
              less.
            </p>
          </Reveal>

          <Reveal
            delay={120}
            className="rounded-2xl border border-line bg-card p-6"
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Today's Appointments", value: "24" },
                { label: "Doctors", value: "9" },
                { label: "Patients", value: "312" },
              ].map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-xl border border-line bg-page p-3 transition-colors hover:border-line-strong"
                >
                  <p className="font-plex-mono text-lg font-bold text-heading">{tile.value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-faint">{tile.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {[
                {
                  name: "Priya Sharma",
                  meta: "Dr. Mehta · 10:30 AM",
                  status: "Confirmed",
                },
                {
                  name: "Arjun Nair",
                  meta: "Dr. Iyer · 11:00 AM",
                  status: "Pending",
                },
                {
                  name: "Kavya Reddy",
                  meta: "Dr. Mehta · 11:15 AM",
                  status: "Confirmed",
                },
              ].map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm transition-colors hover:border-line-strong"
                >
                  <div>
                    <p className="text-heading">{row.name}</p>
                    <p className="font-plex-mono text-xs text-faint">{row.meta}</p>
                  </div>
                  <span
                    className={`rounded-sm px-2 py-0.5 font-plex-mono text-[10px] font-semibold uppercase tracking-wide ${
                      row.status === "Confirmed"
                        ? "bg-stamp-soft text-stamp"
                        : "bg-rust-soft text-rust"
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
      <section id="pricing" className={`py-24 ${CONTAINER}`}>
        <Reveal>
          <p className="font-plex-mono text-xs uppercase tracking-[0.25em] text-accent">
            Pricing
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            Simple, hospital-sized plans
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PRICING_TIERS.map((tier, i) => (
            <Reveal
              key={tier.name}
              delay={i * 100}
              className={`relative rounded-2xl border p-6 transition-all duration-200 ${
                tier.comingSoon
                  ? "border-line opacity-70"
                  : "border-accent/40 bg-paper text-ink hover:-translate-y-1"
              }`}
            >
              {tier.comingSoon ? (
                <span className="absolute -top-3 right-6 -rotate-3 rounded-sm bg-card-strong px-2.5 py-1 font-plex-mono text-[10px] font-semibold uppercase tracking-wide text-muted ring-1 ring-line">
                  Coming soon
                </span>
              ) : (
                <span className="absolute -top-3 right-6 -rotate-3 rounded-sm bg-stamp px-2.5 py-1 font-plex-mono text-[10px] font-semibold uppercase tracking-wide text-white">
                  Available now
                </span>
              )}
              <p
                className={`font-plex-mono text-xs font-semibold uppercase tracking-wide ${
                  tier.comingSoon ? "text-faint" : "text-ink/60"
                }`}
              >
                {tier.name}
              </p>
              {/* Pricing & feature list aren't finalized for this tier yet —
                  blurred rather than shown as real numbers, so nobody reads
                  ₹15k/₹42k as a committed price. */}
              <div className={tier.comingSoon ? "pointer-events-none select-none blur-sm" : undefined}>
                <p className="mt-2 font-display text-3xl font-semibold">
                  {tier.price || "Custom"}
                  {tier.period && (
                    <span className={`font-plex text-base font-normal ${tier.comingSoon ? "text-faint" : "text-ink/50"}`}>
                      {tier.period}
                    </span>
                  )}
                </p>
                <p className={`mt-2 text-sm ${tier.comingSoon ? "text-body" : "text-ink/70"}`}>{tier.tagline}</p>
                <ul className={`mt-5 space-y-2 text-sm ${tier.comingSoon ? "text-body" : "text-ink/80"}`}>
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className={`mt-0.5 ${tier.comingSoon ? "text-faint" : "text-accent"}`}>&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              {tier.comingSoon ? (
                <span className="mt-6 block cursor-not-allowed rounded-lg border border-line-strong px-4 py-2 text-center text-sm font-medium text-faint">
                  Coming soon
                </span>
              ) : (
                <button
                  onClick={() => setActiveModal("sales")}
                  className="mt-6 block w-full cursor-pointer rounded-lg bg-accent px-4 py-2 text-center text-sm font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5"
                >
                  {tier.cta}
                </button>
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <Reveal as="section" className="border-t border-line py-24">
        <div className={`${CONTAINER} flex justify-center`}>
          <div className="relative max-w-2xl -rotate-1 rounded-2xl border border-paper-line bg-paper px-8 py-10 text-center text-ink shadow-xl shadow-black/10 sm:px-12">
            <span className="absolute -top-7 left-8 font-display text-7xl text-accent/60" aria-hidden="true">
              &ldquo;
            </span>
            <p className="font-display text-xl font-medium leading-snug md:text-2xl">
              Patients book themselves and reception just confirms and goes —
              our front desk workload dropped almost overnight.
            </p>
            <p className="mt-5 font-plex-mono text-xs uppercase tracking-wide text-ink/50">
              — Hospital Operations Team, Currez partner hospital
            </p>
          </div>
        </div>
      </Reveal>

      {/* Final CTA */}
      <Reveal
        as="section"
        id="contact"
        className="bg-ink py-24 text-center text-white"
      >
        <div className={CONTAINER}>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Ready to move your hospital onto Currez?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/70">
            Reach out and we'll get your hospital's branded booking site live in
            minutes.
          </p>
          <button
            onClick={() => setActiveModal("onboard")}
            className="mt-8 inline-block cursor-pointer rounded-lg bg-accent-glow px-6 py-3 text-sm font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-glow/30"
          >
            Get Your Hospital Onboarded
          </button>
        </div>
      </Reveal>

      {/* Contact us — persistent, reachable from anywhere on the page */}
      <button
        onClick={() => setActiveModal("contact")}
        className="fixed bottom-6 right-6 z-40 flex cursor-pointer items-center gap-2.5 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5"
      >
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-glow opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-glow" />
        </span>
        Contact Us
      </button>

      {activeModal && (
        <LeadCaptureModal
          title={LEAD_MODALS[activeModal].title}
          subtitle={LEAD_MODALS[activeModal].subtitle}
          intent={LEAD_MODALS[activeModal].intent}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Footer */}
      <footer
        className={`flex flex-col items-center justify-between gap-4 border-t border-line py-8 font-plex-mono text-[11px] text-faint sm:flex-row ${CONTAINER}`}
      >
        <p>
          © {new Date().getFullYear()} Currez Technologies. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-6 uppercase tracking-wide">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-body"
            >
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default CompanyLandingPage;
