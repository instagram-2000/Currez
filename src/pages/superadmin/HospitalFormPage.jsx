import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createHospital, updateHospital, DEFAULT_OPD_HOURS } from '../../firebase/hospitals'
import { useAuth } from '../../contexts/AuthContext'

const inputClass =
  'mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-heading placeholder:text-faint focus:border-line-strong focus:outline-none'
const labelClass = 'block text-sm font-medium text-body'

function Field({ label, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded border border-line bg-card"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-heading focus:border-line-strong focus:outline-none"
        />
      </div>
    </Field>
  )
}

// Shared create/edit form for hospitals.slug is immutable once created, since
// it's also the Firestore doc id and the tenant subdomain.
function HospitalFormPage({ mode = 'create', hospital, onSaved }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [slug, setSlug] = useState(hospital?.slug || '')
  const [title, setTitle] = useState(hospital?.title || '')
  const [primaryColor, setPrimaryColor] = useState(hospital?.branding?.primaryColor || '#6366f1')
  const [secondColor, setSecondColor] = useState(hospital?.branding?.secondColor || '#0f172a')
  const [bgImage, setBgImage] = useState(hospital?.branding?.logos?.bgImage || '')
  const [smallLogo, setSmallLogo] = useState(hospital?.branding?.logos?.smallLogo || '')
  const [address, setAddress] = useState(hospital?.footer?.address || '')
  const [phone, setPhone] = useState(hospital?.footer?.phone || '')
  const [email, setEmail] = useState(hospital?.footer?.email || '')

  const [heroHeadline, setHeroHeadline] = useState(hospital?.hero?.headline || '')
  const [heroSubtitle, setHeroSubtitle] = useState(hospital?.hero?.subtitle || '')
  const [emergencyEnabled, setEmergencyEnabled] = useState(hospital?.emergency?.enabled || false)
  const [emergencyPhone, setEmergencyPhone] = useState(hospital?.emergency?.phone || '')
  const [yearsServing, setYearsServing] = useState(hospital?.yearsServing || '')

  const opdHoursSeed = hospital?.opdHours?.length ? hospital.opdHours : DEFAULT_OPD_HOURS
  const [weekdayHours, setWeekdayHours] = useState(opdHoursSeed[0]?.hours || '')
  const [sundayHours, setSundayHours] = useState(opdHoursSeed[1]?.hours || '')
  const [emergencyHours, setEmergencyHours] = useState(opdHoursSeed[2]?.hours || '')

  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaved(false)
    setSubmitting(true)

    const data = {
      title,
      branding: {
        primaryColor,
        secondColor,
        logos: { bgImage, smallLogo },
      },
      footer: { address, phone, email },
      hero: { headline: heroHeadline, subtitle: heroSubtitle },
      emergency: { enabled: emergencyEnabled, phone: emergencyPhone },
      yearsServing: yearsServing ? Number(yearsServing) : null,
      opdHours: [
        { day: 'Mon – Sat', hours: weekdayHours },
        { day: 'Sunday', hours: sundayHours },
        { day: 'Emergency', hours: emergencyHours },
      ],
    }

    try {
      if (mode === 'create') {
        const newSlug = await createHospital(slug, data, user.uid)
        navigate(`/superadmin/hospitals/${newSlug}`)
      } else {
        await updateHospital(hospital.slug, data)
        setSaved(true)
        onSaved?.()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const form = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Subdomain slug">
          <input
            type="text"
            required
            disabled={mode === 'edit'}
            placeholder="e.g. sunrise-hospital"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={`${inputClass} ${mode === 'edit' ? 'cursor-not-allowed opacity-50' : ''}`}
          />
          {mode === 'create' && (
            <p className="mt-1 text-xs text-faint">
              Lowercase letters, numbers and hyphens only. Cannot be changed later.
            </p>
          )}
        </Field>

        <Field label="Hospital name">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-heading">Hero</h3>
        <p className="mt-1 text-xs text-faint">
          Shown on the public landing page. Leave blank to fall back to a generic welcome message.
        </p>
        <div className="mt-3 space-y-4">
          <Field label="Headline">
            <input
              type="text"
              placeholder="e.g. Care you can trust, any hour of the day."
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Subtitle">
            <textarea
              rows={2}
              placeholder="A short paragraph describing the hospital."
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-heading">Emergency contact</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-body">
            <input
              type="checkbox"
              checked={emergencyEnabled}
              onChange={(e) => setEmergencyEnabled(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-line-strong bg-card"
            />
            Show 24/7 emergency bar
          </label>
          <Field label="Emergency phone">
            <input
              type="text"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-heading">Theme</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ColorField label="Primary color" value={primaryColor} onChange={setPrimaryColor} />
          <ColorField label="Secondary color" value={secondColor} onChange={setSecondColor} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Background image URL">
            <input
              type="url"
              value={bgImage}
              onChange={(e) => setBgImage(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Logo URL">
            <input
              type="url"
              value={smallLogo}
              onChange={(e) => setSmallLogo(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-heading">Contact / footer</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Address">
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Phone">
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Years serving the city">
            <input
              type="number"
              min="0"
              value={yearsServing}
              onChange={(e) => setYearsServing(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-heading">OPD hours</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Mon – Sat">
            <input
              type="text"
              placeholder="9:00 am – 8:00 pm"
              value={weekdayHours}
              onChange={(e) => setWeekdayHours(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Sunday">
            <input
              type="text"
              placeholder="10:00 am – 2:00 pm"
              value={sundayHours}
              onChange={(e) => setSundayHours(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Emergency">
            <input
              type="text"
              placeholder="Open 24/7"
              value={emergencyHours}
              onChange={(e) => setEmergencyHours(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && <p className="text-sm text-emerald-500">Saved.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Saving…' : mode === 'create' ? 'Create hospital' : 'Save changes'}
      </button>
    </form>
  )

  if (mode !== 'create') return form

  return (
    <div className="max-w-2xl">
      <Link to="/superadmin/hospitals" className="text-sm text-muted hover:text-heading">
        &larr; Back to hospitals
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-heading">New hospital</h1>
      <div className="mt-6">{form}</div>
    </div>
  )
}

export default HospitalFormPage
