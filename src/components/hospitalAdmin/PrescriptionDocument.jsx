import Modal from '../common/Modal'
import PrintPortal from '../common/PrintPortal'
import NavIcon from '../common/NavIcon'

function formatTimestamp(ts) {
  const date = ts?.toDate?.()
  return date ? date.toLocaleDateString() : ''
}

// The letterhead document itself — rendered twice by PrescriptionDocument:
// once inline for on-screen viewing, once inside a PrintPortal for
// printing, so the two views can never drift apart.
function PrescriptionContent({ appointment, hospital, doctor }) {
  const prescription = appointment.prescription || []
  const tests = appointment.tests || []
  const logo = hospital?.branding?.logos?.smallLogo
  const accent = hospital?.branding?.primaryColor || '#4f46e5'
  const reference = appointment.token || appointment.id

  return (
    <div>
      <div
        className="flex items-start justify-between gap-4 border-b-2 pb-4"
        style={{ borderColor: 'color-mix(in srgb, ' + accent + ' 30%, transparent)' }}
      >
        <div className="flex items-start gap-3">
          {logo && (
            <img src={logo} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-line" />
          )}
          <div>
            <h2 className="text-lg font-bold text-heading">{hospital?.title || 'Hospital'}</h2>
            {hospital?.footer?.address && <p className="mt-0.5 text-xs text-muted">{hospital.footer.address}</p>}
            <p className="text-xs text-muted">
              {[hospital?.footer?.phone, hospital?.footer?.email].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-semibold tracking-widest text-faint uppercase">Prescription</p>
          {reference && <p className="mt-0.5 font-mono text-xs font-semibold text-heading">Rx-{reference}</p>}
          <p className="mt-1 text-xs text-muted">
            {appointment.date}
            {appointment.time ? ` · ${appointment.time}` : ''}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl border border-line bg-card-strong/50 p-4 text-sm">
        <div>
          <p className="text-xs text-faint">Patient</p>
          <p className="font-medium text-heading">{appointment.patientName || '—'}</p>
          {appointment.patientPhone && <p className="text-xs text-muted">{appointment.patientPhone}</p>}
        </div>
        <div>
          <p className="text-xs text-faint">Doctor</p>
          <p className="font-medium text-heading">{appointment.doctorName || '—'}</p>
          {doctor?.specialization && <p className="text-xs text-muted">{doctor.specialization}</p>}
        </div>
      </div>

      {appointment.concerns && (
        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide text-faint uppercase">Diagnosis / Notes</p>
          <p className="mt-1 text-sm whitespace-pre-wrap text-body">{appointment.concerns}</p>
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs font-semibold tracking-wide text-faint uppercase">Medicines</p>
        {prescription.length === 0 ? (
          <p className="mt-1 text-sm text-faint">No medicines prescribed for this visit.</p>
        ) : (
          <div className="mt-2 overflow-hidden rounded-xl border border-line">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead>
                <tr className="bg-card-strong/50 text-left text-xs font-semibold tracking-wide text-faint uppercase">
                  <th className="px-3 py-2 w-8">#</th>
                  <th className="px-3 py-2">Medicine</th>
                  <th className="px-3 py-2">Dosage</th>
                  <th className="px-3 py-2">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {prescription.map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-faint">{i + 1}</td>
                    <td className="px-3 py-2 font-medium text-heading">{row.medicine}</td>
                    <td className="px-3 py-2 text-body">{row.dosage || '—'}</td>
                    <td className="px-3 py-2 text-body">{row.duration || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {tests.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide text-faint uppercase">Tests / Diagnostics</p>
          <ul className="mt-2 space-y-1 text-sm text-body">
            {tests.map((row, i) => (
              <li key={i}>
                <span className="font-medium text-heading">{row.name}</span>
                {row.notes && <span className="text-muted"> — {row.notes}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex items-end justify-between border-t border-line pt-4">
        <p className="max-w-xs text-[10px] leading-relaxed text-faint">
          Generated via Currez on {formatTimestamp(appointment.consultedAt) || 'this visit'}. Not a substitute for
          the original signed prescription.
        </p>
        <div className="text-center">
          <div className="h-8 w-32 border-b border-line-strong" />
          <p className="mt-1 text-[10px] text-faint">
            {appointment.doctorName ? `Dr. ${appointment.doctorName.replace(/^dr\.?\s*/i, '')}` : "Doctor's signature"}
          </p>
        </div>
      </div>
    </div>
  )
}

// Read-only letterhead view of one completed visit's clinical notes — the
// data (`concerns`/`prescription`/`tests`) is written once, by the doctor,
// via CompleteVisitModal during visit completion; this component only ever
// displays it. `doctor` is optional (used for specialization) — falls back
// gracefully to just the name already denormalized onto the appointment.
function PrescriptionDocument({ appointment, hospital, doctor, onClose }) {
  return (
    <Modal onClose={onClose} className="max-w-lg">
      <PrescriptionContent appointment={appointment} hospital={hospital} doctor={doctor} />
      <PrintPortal>
        <PrescriptionContent appointment={appointment} hospital={hospital} doctor={doctor} />
      </PrintPortal>

      <div className="mt-5 flex justify-end gap-3 border-t border-line pt-4">
        <button
          onClick={() => window.print()}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-line px-3.5 py-2 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading"
        >
          <NavIcon name="prescription" className="h-3.5 w-3.5" />
          Print / Save as PDF
        </button>
        <button
          onClick={onClose}
          className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-md"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}

export default PrescriptionDocument
