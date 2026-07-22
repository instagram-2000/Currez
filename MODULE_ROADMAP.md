# Module Roadmap — Proposed Modules

**What this is:** a shortlist of the next big modules worth building, with what each one does and
exactly what each user role can see/do in it. This is a *product proposal*, not the build
instructions — once one of these is greenlit, build it by following
[`NEW_MODULE_DEVELOPMENT_GUIDE.md`](./NEW_MODULE_DEVELOPMENT_GUIDE.md) (registry entry → page →
data layer → Firestore rule → route). Every module below is designed to slot into that existing
system: one `FEATURE_REGISTRY` entry, **off by default**, turned on per-hospital by the Super
Admin — exactly like Chatbot works today.

**Roles referenced below** (`src/utils/roles.js`): **Super Admin**, **Hospital Admin**,
**Receptionist**, **Doctor**. There is no logged-in "Patient" role today — patients interact
through the public booking form and the token-based `/appointment-status` lookup. Where a module
has patient-facing value, it hooks into that existing token flow rather than assuming a new login
system (called out explicitly where relevant).

---

## Recommended build order

| # | Module | Why this order | Effort |
|---|---|---|---|
| 1 | [Billing & Invoicing](#1-billing--invoicing) | Every hospital needs this on day one; unlocks revenue reporting for everything after it | Medium |
| 2 | [E-Prescription](#2-e-prescription) | Data already half-exists (`appointment.prescription`) — mostly UI + PDF, low risk | Small–Medium |
| 3 | [Lab & Diagnostics Reports](#3-lab--diagnostics-reports) | Same story — `appointment.tests` already exists, this formalizes it | Medium |
| 4 | [Patient Medical Records (EHR)](#4-patient-medical-records-ehr-timeline) | Mostly aggregates data the app already has (appointments, prescriptions, tests) | Medium |
| 5 | [Notifications & Reminders](#5-notifications--reminders) | High patient-experience value; email path is cheap, SMS/WhatsApp needs a Cloud Function | Medium |
| 6 | [Pharmacy & Inventory](#6-pharmacy--inventory-management) | Real inventory/stock logic, only worth it for hospitals with an in-house pharmacy | Large |

Later ideas worth a line but not detailed here: **Analytics & Reports Dashboard** (revenue/doctor
performance/no-show trends, for Hospital Admin + cross-hospital for Super Admin), **Patient Portal**
(a real patient login — bigger lift, needs a new role/auth model), **Telemedicine** (video
consultations), **Insurance/TPA claims**.

---

## 1. Billing & Invoicing

**Registry key:** `billing` · **Category:** operations

Turns a completed visit into an itemized, printable invoice — consultation fee, tests, pharmacy
items if module 6 exists — with a paid/due status, instead of the current `paymentMethod` field on
the appointment being the only money record.

| Role | Can do |
|---|---|
| **Super Admin** | Nothing operational — optionally sees aggregate "revenue processed" per hospital later, for account-health visibility, not day-to-day billing |
| **Hospital Admin** | Everything Receptionist can, plus: daily/monthly collection totals, outstanding-dues list, mark an invoice refunded, export |
| **Receptionist** | Generate an invoice from a completed appointment, add/edit line items, record payment (cash/online), print/share receipt |
| **Doctor** | Read-only: sees whether *their* consultation for a visit is marked paid (useful context, no edit rights) |

**Key screens:** `Billing` nav item (Hospital Admin + Receptionist) — invoice list with
paid/due filter, invoice detail/print view, "Create invoice" from an appointment's row.

**New data:** `invoices` collection — `{ hospitalId, appointmentId, patientId, lineItems: [{label, amount}], subtotal, discount, total, status: 'paid'|'due'|'partial', paymentMethod, issuedBy, issuedAt }`.

---

## 2. E-Prescription

**Registry key:** `prescriptions` · **Category:** clinical

`CompleteVisitModal` already captures `prescription: [{medicine, dosage, duration}]` when a doctor
completes a visit — this module turns that into a first-class, shareable document: hospital
letterhead, doctor name/signature line, downloadable PDF, and a searchable prescription history per
patient instead of digging through past appointments one by one.

| Role | Can do |
|---|---|
| **Super Admin** | Nothing — clinical data, no operational reason to touch it |
| **Hospital Admin** | Read-only view of any prescription issued at their hospital (compliance/audit only, no editing medical content) |
| **Receptionist** | View and print/share a patient's prescription at the front desk (no edit) |
| **Doctor** | Full access — write prescriptions (already does, via visit completion), view their own patients' prescription history across visits |
| **Patient** (no login) | View/download their own prescription as a PDF from the existing token-based `/appointment-status` page — no new auth needed |

**Key screens:** `Prescriptions` nav item (Doctor: write + history; Admin/Receptionist:
read-only list); a "Download PDF" button added to `/appointment-status`.

**New data:** none strictly required — can read straight off `appointments.prescription`. A
dedicated `prescriptions` collection is worth adding only if patient history needs to be queried
independent of appointments (faster "all prescriptions for patient X" without scanning visits).

---

## 3. Lab & Diagnostics Reports

**Registry key:** `labReports` · **Category:** clinical

Same relationship to `appointment.tests` as E-Prescription has to `prescription`: formalizes an
already-captured field into a trackable workflow — ordered → sample collected → in progress →
ready — with the actual report file (PDF/image) attached via Firebase Storage.

| Role | Can do |
|---|---|
| **Super Admin** | Nothing |
| **Hospital Admin** | Read-only view of all lab orders/reports at their hospital, for oversight |
| **Receptionist** | Update order status (collected/in-progress/ready), upload the report file when it arrives from the lab |
| **Doctor** | Order tests during a visit (already partly does this), view results once marked ready |
| **Patient** (no login) | Download their report from `/appointment-status` once status is "ready" |

**Key screens:** `Lab Reports` nav item — a status-column list (mirrors the Appointments
tab pattern), upload dialog, "ready" badge that also surfaces on the patient's status page.

**New data:** `labOrders` collection — `{ hospitalId, appointmentId, patientId, testName, status, reportFileUrl, orderedBy, orderedAt, updatedAt }`.

---

## 4. Patient Medical Records (EHR timeline)

**Registry key:** `medicalRecords` · **Category:** clinical

A single "patient profile" view that aggregates what's already scattered across appointments —
visit history, past concerns, prescriptions, tests — plus new structured fields: allergies,
chronic conditions, and a vitals log (BP, sugar, weight) charted over time. This is what makes a
doctor's second visit with a patient informed instead of starting from zero.

| Role | Can do |
|---|---|
| **Super Admin** | Nothing |
| **Hospital Admin** | Read-only access to any patient's full record (administrative oversight, e.g. resolving a complaint) |
| **Receptionist** | Read-only *basic* info only — contact details, allergy flag for safety — not clinical notes or vitals history |
| **Doctor** | Full access — add/edit allergies & conditions, log vitals during a visit, view the complete cross-visit timeline |

**Key screens:** a "Patient Record" detail view opened from the Patients list (Doctor sees
full tabs: Timeline / Vitals / Allergies; Admin sees the same read-only; Receptionist sees a
trimmed contact-card version).

**New data:** extends the existing `patients/{id}` doc with `allergies: []`, `conditions: []`;
adds a `vitals` subcollection `{ recordedAt, bp, sugar, weightKg, recordedBy }`. The visit timeline
itself needs no new storage — it's just `appointments` queried by `patientId` (already indexed by
`hospitalId` + `date`).

---

## 5. Notifications & Reminders

**Registry key:** `notifications` · **Category:** engagement

Automated messages at the moments that matter: booking confirmation, a reminder the day before (or
hour before) an appointment, "your prescription is ready," "your lab report is ready," and
follow-up-due nudges. `src/utils/emailjs.js` already exists, so email is the cheap first channel;
SMS/WhatsApp needs real API keys and — per the architecture guide's §4 pattern — **must** go
through a Cloud Function (`assertFeatureEnabled('notifications')`), never called from the client.

| Role | Can do |
|---|---|
| **Super Admin** | Enables the module per hospital (standard), and would see cross-hospital send volume if this ever affects billing |
| **Hospital Admin** | Configure which triggers are on (confirmation/reminder/results-ready/follow-up), view the send log |
| **Receptionist** | Manually trigger a resend or an extra reminder for a specific appointment |
| **Doctor** | No direct UI — their actions (completing a visit, marking a report ready) are what *trigger* a notification |

**Key screens:** `Notifications` settings tab (Hospital Admin) with trigger toggles + send
log; a small "Resend reminder" button added to an appointment row for Receptionist.

**New data:** `notificationLog` collection for delivery status/debugging; a Cloud Function per
trigger, each starting with the `assertFeatureEnabled` guard already documented in the dev guide.

---

## 6. Pharmacy & Inventory Management

**Registry key:** `pharmacy` · **Category:** operations

For hospitals with an in-house pharmacy: a medicine catalog with live stock counts, low-stock
alerts, and "dispense against a prescription" that auto-deducts stock and (with module 1 enabled)
adds the dispensed items straight onto that visit's invoice.

| Role | Can do |
|---|---|
| **Super Admin** | Nothing |
| **Hospital Admin** | Manage the medicine catalog (add/edit/price), set reorder thresholds, view stock and dispense reports |
| **Receptionist** | Dispense medicines against a prescription, which decrements stock and can push a line item to Billing |
| **Doctor** | Read-only stock lookup while prescribing (see if a medicine is in stock) — nice-to-have, not essential for v1 |

**Key screens:** `Pharmacy` nav item — stock list with low-stock highlighting, a "Dispense"
flow opened from a patient's prescription.

**New data:** `medicines` collection `{ hospitalId, name, unit, stockQty, reorderLevel, price }`,
`dispenseLog` collection `{ hospitalId, medicineId, patientId, appointmentId, qty, dispensedBy, dispensedAt }`.
This is the most complex module here (real stock-transaction logic, similar in shape to the
doctor-slot-claiming transactions already in `firebase/appointments.js`) — build it last, and only
for hospitals that actually run their own pharmacy.

---

## Notes on fit with the existing system

- Every module above defaults `isCore: false`, `defaultEnabled: false` — shipping one never turns
  it on for an existing hospital automatically, matching the project's whole premise.
- Clinical modules (2, 3, 4) deliberately give **Hospital Admin read-only, not edit** access to
  medical content — administrative oversight without a non-clinician role editing prescriptions or
  vitals.
- Patient-facing pieces (prescription/report download) reuse the existing token-based
  `/appointment-status` lookup instead of proposing a new patient login — smallest change that
  still gets patients their documents.
- Anything touching real money (Billing, Pharmacy) or third-party secrets (SMS/WhatsApp in
  Notifications) needs its own Firestore rule and/or Cloud Function per §7/§8 of the dev guide —
  a hidden button is not security.
