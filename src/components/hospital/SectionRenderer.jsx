import ServicesSection from './ServicesSection'
import DepartmentsSection from './DepartmentsSection'
import DoctorsSection from './DoctorsSection'
import TestimonialsSection from './TestimonialsSection'

// Registry of optional homepage sections a hospital config can turn on/off
// and reorder. Add new keys here as new optional sections are introduced.
// `doctors` is special-cased: it's driven by live staff accounts, not
// `optionals.doctors.items`, so it gets the shared `doctors` list instead
// of its own `data` slice.
const SECTION_COMPONENTS = {
  services: ServicesSection,
  departments: DepartmentsSection,
  doctors: DoctorsSection,
  testimonials: TestimonialsSection,
}

function SectionRenderer({ optionals, doctors, slug }) {
  const sections = Object.entries(optionals ?? {})
    .filter(([key, section]) => section?.enabled === 'on' && SECTION_COMPONENTS[key])
    .sort((a, b) => (a[1].orderNumber ?? 0) - (b[1].orderNumber ?? 0))

  return sections.map(([key, section]) => {
    const Component = SECTION_COMPONENTS[key]
    return key === 'doctors' ? (
      <Component key={key} doctors={doctors} slug={slug} />
    ) : (
      <Component key={key} data={section} />
    )
  })
}

export default SectionRenderer
