# Bed & Ward Management — Detailed Architecture Plan

## 1. Overview

Adds inpatient bed management to the hospital staff portal. Each hospital configures
its own floor → ward → room → bed hierarchy. Staff can admit/discharge patients,
track bed occupancy in real time, and optionally auto-generate billing on discharge.

**Registry key:** `bedManagement` · **Category:** operations

---

## 2. Hierarchical Data Model

### 2.1 Bed Configuration (`bedConfig/{hospitalId}`)

One document per hospital. The Hospital Admin builds their own physical layout:

```json
{
  "hospitalId": "city-hospital",
  "bedTypes": {
    "general":    { "label": "General",     "ratePerDay": 500 },
    "semiPrivate": { "label": "Semi-Private", "ratePerDay": 1500 },
    "private":    { "label": "Private Room", "ratePerDay": 3000 },
    "icu":        { "label": "ICU",          "ratePerDay": 5000 },
    "nicu":       { "label": "NICU",         "ratePerDay": 8000 }
  },
  "floors": [
    {
      "id": "floor-1",
      "name": "Ground Floor",
      "order": 1,
      "wards": [
        {
          "id": "ward-general-1",
          "name": "General Ward 1",
          "order": 1,
          "rooms": [
            {
              "id": "room-g1-01",
              "name": "Room 101",
              "beds": [
                { "bedId": "G1-01", "type": "general" },
                { "bedId": "G1-02", "type": "general" },
                { "bedId": "G1-03", "type": "general" }
              ]
            },
            {
              "id": "room-g1-02",
              "name": "Room 102",
              "beds": [
                { "bedId": "G1-04", "type": "general" },
                { "bedId": "G1-05", "type": "general" }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "floor-2",
      "name": "First Floor",
      "order": 2,
      "wards": [
        {
          "id": "ward-icu",
          "name": "ICU",
          "order": 1,
          "rooms": [
            {
              "id": "room-icu-01",
              "name": "ICU Cabin 1",
              "beds": [
                { "bedId": "ICU-01", "type": "icu" },
                { "bedId": "ICU-02", "type": "icu" }
              ]
            }
          ]
        },
        {
          "id": "ward-ortho",
          "name": "Orthopedics",
          "order": 2,
          "rooms": [
            {
              "id": "room-ort-01",
              "name": "Room 201",
              "beds": [
                { "bedId": "ORT-01", "type": "private" },
                { "bedId": "ORT-02", "type": "semiPrivate" }
              ]
            }
          ]
        }
      ]
    }
  ],
  "updatedAt": "<serverTimestamp>",
  "updatedBy": "admin@hospital.com"
}
```

**Why this structure:**
- `floors[]` → top-level grouping (physical building layout)
- `wards[]` inside each floor → clinical department grouping
- `rooms[]` inside each ward → physical rooms
- `beds[]` inside each room → individual beds with type
- `bedTypes` map at root → hospital defines its own types with daily rates

**Document size consideration:** A large hospital with 10 floors × 10 wards × 10 rooms × 4 beds = 4000 bed entries. At ~50 bytes per bed, that's ~200 KB — well under Firestore's 1 MB limit. Hospitals with more beds than this can split by floor into separate config docs.

### 2.2 Admissions (`admissions/{admissionId}`)

One document per admission. Auto-generated ID.

```json
{
  "hospitalId": "city-hospital",
  "patientId": "abc123",
  "patientName": "Rahul Sharma",
  "patientPhone": "9876543210",
  
  "floorId": "floor-2",
  "floorName": "First Floor",
  "wardId": "ward-icu",
  "wardName": "ICU",
  "roomId": "room-icu-01",
  "roomName": "ICU Cabin 1",
  "bedId": "ICU-01",
  "bedType": "icu",
  
  "status": "active",
  "admittedAt": "<serverTimestamp>",
  "dischargedAt": null,
  "dischargedBy": null,
  
  "admittedBy": "receptionist@hospital.com",
  "admittedByuid": "uid-of-receptionist",
  
  "attendingDoctor": "Dr. Patil",
  "attendingDoctorId": "uid-of-doctor",
  
  "diagnosis": "Post-appendectomy recovery",
  "notes": "Monitor vitals every 4 hours",
  
  "dailyRate": 5000,
  "totalDays": 0,
  "totalCharges": 0,
  
  "linkedAppointmentId": null,
  "linkedInvoiceId": null,
  
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>"
}
```

### 2.3 Bed Status — Derived, Not Stored

Bed status (vacant/occupied) is computed at runtime from admissions, NOT stored on the
bed config. This avoids two documents going out of sync.

```
occupied bed = admission where bedId matches AND status === 'active'
```

The page loads all active admissions for the hospital, then overlays them on the bed
config to color-code each bed.

---

## 3. UI Flow — Hierarchical Selection

### 3.1 Main Bed Overview Page (`/dashboard/beds`)

The primary screen uses a left-panel + right-detail layout:

```
┌─────────────────────────────────────────────────────────┐
│  Bed Management                          [Configure]     │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  FLOORS      │   WARD VIEW                             │
│              │                                          │
│  ▸ Ground    │   ┌──────────┐ ┌──────────┐ ┌────────┐  │
│    Floor     │   │ Room 101 │ │ Room 102 │ │ Room   │  │
│              │   │ ┌──┐┌──┐│ │ ┌──┐┌──┐│ │  103   │  │
│  ▸ First     │   │ │G1││G1││ │ │G1││G1││ │ ┌──┐   │  │
│    Floor     │   │ │01││02││ │ │04││05││ │ │G1│   │  │
│              │   │ └──┘└──┘│ │ └──┘└──┘│ │ │06│   │  │
│  STATS       │   │  [2/3]  │ │  [0/2]  │ │ └──┘   │  │
│              │   │ occupied│ │  vacant  │ │  vacant │  │
│  Total: 30   │   └──────────┘ └──────────┘ └────────┘  │
│  Occupied: 8 │                                          │
│  Vacant: 22  │   ← Bed colors: 🟢 vacant  🔴 occupied  │
│  Occupancy:  │       🟡 reserved (discharge today)     │
│   26.7%      │                                          │
│              │   [Admit Patient]  [Discharge Selected]  │
└──────────────┴──────────────────────────────────────────┘
```

**Left Panel:**
- Floor list (clickable tabs)
- Summary stats (total beds, occupied, vacant, occupancy %)
- Ward filter within selected floor

**Right Panel:**
- Room-by-room grid for the selected floor
- Each room shows its beds as colored blocks
- Click a vacant bed → Admit modal opens
- Click an occupied bed → Shows patient info + Discharge button
- Legend at bottom

### 3.2 Selection Flow

```
Floor tab (e.g. "First Floor")
  └→ Shows all wards on that floor
      └→ Shows all rooms in each ward
          └→ Shows all beds in each room
              └→ Each bed is colored by status
                  └→ Click bed → Admit or View/Discharge
```

### 3.3 Admit Patient Modal

```
┌─────────────────────────────────────────┐
│  Admit Patient                          │
│                                         │
│  Bed: ICU-01 (ICU) — ICU Cabin 1       │
│  Rate: ₹5,000/day                      │
│                                         │
│  Patient *                              │
│  ┌─────────────────────────────────┐    │
│  │ Search existing patient...  🔍  │    │
│  └─────────────────────────────────┘    │
│  OR                                     │
│  ┌─────────────────────────────────┐    │
│  │ + New Patient                   │    │
│  │  Name:  [________]              │    │
│  │  Phone: [________]              │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Attending Doctor *                     │
│  ┌─────────────────────────────────┐    │
│  │ Select doctor...            ▾   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Diagnosis *                            │
│  ┌─────────────────────────────────┐    │
│  │ [________________________]      │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Notes (optional)                       │
│  ┌─────────────────────────────────┐    │
│  │ [________________________]      │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Cancel]              [Admit Patient]  │
└─────────────────────────────────────────┘
```

### 3.4 Discharge Flow

```
┌─────────────────────────────────────────┐
│  Discharge Patient                      │
│                                         │
│  Patient: Rahul Sharma                  │
│  Bed: ICU-01 (ICU)                     │
│  Admitted: 15 Jul 2026 (3 days ago)    │
│  Daily Rate: ₹5,000                    │
│  Total Charges: ₹15,000                │
│                                         │
│  Discharge Summary                      │
│  ┌─────────────────────────────────┐    │
│  │ [________________________]      │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ☑ Create billing invoice on discharge  │
│                                         │
│  [Cancel]              [Discharge]      │
└─────────────────────────────────────────┘
```

---

## 4. Component Architecture

### 4.1 New Files

```
src/
  config/
    featureRegistry.js              ← ADD entry
  components/
    common/
      NavIcon.jsx                   ← ADD icon
    hospitalAdmin/
      BedManagementLayout.jsx       ← NEW: left panel + right detail layout
      BedGrid.jsx                   ← NEW: room/bed visual grid component
      BedBlock.jsx                  ← NEW: single bed colored block
      AdmitPatientModal.jsx         ← NEW: admission form
      DischargeModal.jsx            ← NEW: discharge form
      BedConfigEditor.jsx           ← NEW: ward/room/bed configuration
      BedStatsPanel.jsx             ← NEW: occupancy stats sidebar
  firebase/
    bedManagement.js                ← NEW: Firestore accessors
  pages/
    hospitalAdmin/
      BedManagementPage.jsx         ← NEW: main page
  utils/
    bedManagement.js                ← NEW: helper functions
```

### 4.2 Component Hierarchy

```
BedManagementPage
├── BedStatsPanel (left sidebar — stats + floor list)
│   ├── Floor tabs
│   └── Summary cards
├── BedGrid (right main area)
│   ├── WardSection (one per ward on selected floor)
│   │   └── RoomSection (one per room in ward)
│   │       └── BedBlock (one per bed in room)
│   │           ├── Vacant → onClick → AdmitPatientModal
│   │           └── Occupied → onClick → PatientInfoPopover → DischargeModal
│   └── EmptyState (no config yet)
├── AdmitPatientModal (overlay)
├── DischargeModal (overlay)
└── BedConfigEditor (overlay — configure floors/wards/rooms/beds)
```

---

## 5. Firebase Service Layer (`src/firebase/bedManagement.js`)

### Exports

```js
// Subscribe to bed config (real-time)
subscribeBedConfig(hospitalId, callback) → unsubscribe

// Update bed config (Hospital Admin only)
updateBedConfig(hospitalId, config, updatedBy)

// Subscribe to active admissions (real-time)
subscribeActiveAdmissions(hospitalId, callback) → unsubscribe

// Subscribe to all admissions including discharged (for history)
subscribeAllAdmissions(hospitalId, callback, { startDate, endDate }) → unsubscribe

// Admit a patient (transactional — prevents double-booking a bed)
admitPatient({ hospitalId, patientId, patientName, patientPhone, floorId, floorName, 
  wardId, wardName, roomId, roomName, bedId, bedType, dailyRate, attendingDoctor, 
  attendingDoctorId, diagnosis, notes, linkedAppointmentId }, admittedBy)

// Discharge a patient
dischargePatient(admissionId, { dischargeSummary, dischargedBy, createInvoice })

// Get bed occupancy stats
getBedOccupancyStats(hospitalId) → Promise<{ total, occupied, vacant, occupancyRate, byWard, byType }>
```

### Key Pattern: Transactional Admission

```js
// Two things must happen atomically:
// 1. Check no active admission exists for this bed
// 2. Create the admission record
// If either fails, both roll back — no double-booking

export async function admitPatient(data, admittedBy) {
  // Check bed is vacant (no active admission for this bedId)
  const activeForBed = await getDocs(
    query(collection(db, 'admissions'), 
      where('hospitalId', '==', data.hospitalId),
      where('bedId', '==', data.bedId),
      where('status', '==', 'active'))
  )
  if (!activeForBed.empty) {
    throw new Error('This bed is already occupied.')
  }
  
  // Create admission
  const ref = await addDoc(collection(db, 'admissions'), {
    ...data,
    status: 'active',
    admittedBy,
    admittedAt: serverTimestamp(),
    dischargedAt: null,
    totalDays: 0,
    totalCharges: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}
```

---

## 6. Firestore Security Rules

```js
// Bed configuration — read by all staff, write by Hospital Admin only
match /bedConfig/{hospitalId} {
  allow get: if isHospitalStaffOf(hospitalId) && 
    hospitalHasFeature(hospitalId, 'bedManagement');
  allow list: if false;
  allow create, update: if isHospitalAdminOf(hospitalId) && 
    hospitalHasFeature(hospitalId, 'bedManagement');
  allow delete: if false;
}

// Admissions — read by all staff, create/update by authorized roles
match /admissions/{admissionId} {
  allow read: if isHospitalStaffOf(resource.data.hospitalId) && 
    hospitalHasFeature(resource.data.hospitalId, 'bedManagement');
  
  allow create: if isHospitalStaffOf(request.resource.data.hospitalId) && 
    hospitalHasFeature(request.resource.data.hospitalId, 'bedManagement') &&
    (request.resource.data.hospitalId == request.resource.data.hospitalId);
  
  allow update: if isHospitalStaffOf(resource.data.hospitalId) && 
    hospitalHasFeature(resource.data.hospitalId, 'bedManagement');
  
  allow delete: if false;
}
```

---

## 7. Routes (App.jsx)

```jsx
{/* Hospital admin + receptionist, feature-gated */}
<Route element={<RequireRole allowedRoles={[ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST]} />}>
  <Route element={<RequireFeature featureKey="bedManagement" />}>
    <Route path="beds" element={<BedManagementPage tenantSlug={tenantSlug} />} />
  </Route>
</Route>
```

---

## 8. Role Permissions

| Role | Can do |
|---|---|
| **Hospital Admin** | Configure wards/rooms/beds, admit, discharge, view all, occupancy reports |
| **Receptionist** | Admit patients, discharge (with doctor sign-off), view bed status |
| **Doctor** | View bed status in their ward, mark beds for discharge, read-only on config |
| **Super Admin** | Enable/disable module per hospital (standard) |

---

## 9. Integration Points

### With Billing Module
- On discharge, if billing is enabled, auto-create an invoice with:
  - Line item: `Bed charges — {bedType} × {days}` at `{ratePerDay × days}`
  - Line item: (optional) additional charges
- Uses existing `autoCreateConsultationInvoice` pattern from `firebase/billing.js`

### With Appointments Module
- When admitting from an existing appointment, link `linkedAppointmentId`
- Admission record references the appointment that led to admission

### With Prescriptions Module
- Discharged patient's prescriptions are already in the appointments/prescriptions system
- No direct integration needed — they're separate modules

### With Analytics Module
- Bed occupancy stats can be added as a new section in Analytics
- Admission duration, revenue per bed type, occupancy trends

---

## 10. Build Sequence

| Step | File | What |
|---|---|---|
| 1 | `featureRegistry.js` | Add `bedManagement` entry |
| 2 | `NavIcon.jsx` | Add `bed` icon |
| 3 | `firebase/bedManagement.js` | Full service layer (subscribe, admit, discharge, stats) |
| 4 | `utils/bedManagement.js` | Helper functions (compute bed status, format duration) |
| 5 | `BedBlock.jsx` | Single bed colored block component |
| 6 | `BedGrid.jsx` | Room/ward grid layout |
| 7 | `BedStatsPanel.jsx` | Left sidebar with stats + floor nav |
| 8 | `AdmitPatientModal.jsx` | Admission form modal |
| 9 | `DischargeModal.jsx` | Discharge form modal |
| 10 | `BedConfigEditor.jsx` | Configure floors/wards/rooms/beds |
| 11 | `BedManagementPage.jsx` | Main page composing everything |
| 12 | `App.jsx` | Wire route with RequireRole + RequireFeature |
| 13 | `firestore.rules` | Add bedConfig + admissions rules |
| 14 | Build + test | `npm run build`, emulator test |

---

## 11. UI Component Details

### BedBlock States

| State | Color | Border | Badge |
|---|---|---|---|
| Vacant | `bg-emerald-500/10` | `ring-emerald-500/20` | Bed ID |
| Occupied | `bg-red-500/10` | `ring-red-500/20` | Patient initials + days |
| Reserved (discharge today) | `bg-amber-500/10` | `ring-amber-500/20` | "Discharging" |
| Selected (for admit) | `bg-indigo-500/10` | `ring-indigo-500/40 ring-2` | "Selected" |
| Maintenance | `bg-slate-400/10` | `ring-slate-400/20` | "OOS" (out of service) |

### BedBlock Layout

```
┌─────────────┐
│  🔴 ICU-01  │  ← bed ID + status dot
│  ─────────  │
│  R. Sharma  │  ← patient name (if occupied)
│  3 days     │  ← duration (if occupied)
│  ₹15,000    │  ← running charges (if occupied)
└─────────────┘
```

### Floor Selection → Ward View Transition

When a floor tab is clicked:
1. The right panel animates to show wards on that floor
2. Wards are displayed as collapsible sections
3. Each ward contains its rooms in a responsive grid
4. Rooms contain their beds in a flex-wrap layout

### Mobile Layout

On screens < `md`:
- Floor tabs become horizontal scrollable pills
- Stats panel collapses into a top summary bar
- Room grid goes single-column
- Bed blocks become wider horizontal cards instead of small squares

---

## 12. Estimated Effort: Large

~15-20 new files, ~1500-2000 lines of code. The most complex module because:
- Hierarchical config editor (4 levels deep)
- Visual grid layout with responsive design
- Transactional admission (prevent double-booking)
- Discharge → billing integration
- Real-time occupancy overlay

But follows every existing pattern exactly:
- Feature registry entry → sidebar auto-derives → RequireFeature route guard
- Firebase accessor file → onSnapshot subscriptions
- Modal-based workflows (same as CreateInvoiceModal, CompleteVisitModal)
- HospitalAdmin role-only configuration
