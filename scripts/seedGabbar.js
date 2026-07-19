// One-off script: fills in the new landing-page fields + demo content for
// "Gabbar Hospital" so the redesigned public page has something to show.
//
// Firestore rules only allow writing hospitals/doctors from a signed-in
// superadmin session, so this needs your superadmin credentials — passed
// via env vars (never typed into a prompt or committed) so they don't end
// up in shell history any longer than one command:
//
//   SEED_SUPERADMIN_EMAIL=you@example.com SEED_SUPERADMIN_PASSWORD=yourpassword node scripts/seedGabbar.js
//
// PowerShell:
//   $env:SEED_SUPERADMIN_EMAIL="you@example.com"; $env:SEED_SUPERADMIN_PASSWORD="yourpassword"; node scripts/seedGabbar.js
import 'dotenv/config'
import { initializeApp, deleteApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

const superadminEmail = process.env.SEED_SUPERADMIN_EMAIL
const superadminPassword = process.env.SEED_SUPERADMIN_PASSWORD
if (!superadminEmail || !superadminPassword) {
  console.error(
    'Set SEED_SUPERADMIN_EMAIL and SEED_SUPERADMIN_PASSWORD (your superadmin login) before running this script.\n' +
      'Firestore rules require a superadmin session to write hospital/doctor data — see comment at the top of this file.'
  )
  process.exit(1)
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

await signInWithEmailAndPassword(auth, superadminEmail, superadminPassword)
console.log(`Signed in as ${superadminEmail}`)

function randomPassword() {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6).toUpperCase() + '!1'
}

// Creates a doctor's Auth account on an isolated secondary app instance so
// it never disturbs the primary app's superadmin session — same trick
// src/firebase/secondaryAuth.js uses in the browser.
async function createDoctorAuthAccount(email, password) {
  const secondaryApp = initializeApp(firebaseConfig, `doctor-creator-${Date.now()}-${Math.random()}`)
  try {
    const secondaryAuth = getAuth(secondaryApp)
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)
    return cred.user.uid
  } finally {
    await deleteApp(secondaryApp).catch(() => {})
  }
}

async function findGabbarSlug() {
  const directRef = doc(db, 'hospitals', 'gabbar')
  const direct = await getDoc(directRef)
  if (direct.exists()) return 'gabbar'

  const snapshot = await getDocs(collection(db, 'hospitals'))
  const match = snapshot.docs.find((d) => /gabbar/i.test(d.data().title || ''))
  if (match) return match.id

  return null
}

const slug = await findGabbarSlug()
if (!slug) {
  console.error(
    'Could not find a hospital titled "Gabbar Hospital" (or slug "gabbar") in Firestore.\n' +
      'Create it first via the superadmin dashboard, then re-run this script.'
  )
  process.exit(1)
}
console.log(`Found hospital at hospitals/${slug}`)

const hospitalRef = doc(db, 'hospitals', slug)

await setDoc(
  hospitalRef,
  {
    branding: {
      primaryColor: '#6366f1',
      secondColor: '#0b0b14',
      logos: { bgImage: '', smallLogo: '' },
    },
    hero: {
      headline: 'Care you can trust, any hour of the day.',
      subtitle:
        'Gabbar Hospital is a multi-specialty hospital offering 24/7 emergency care, expert consultations across 8 departments, and modern diagnostics — all under one roof.',
    },
    emergency: {
      enabled: true,
      phone: '+91 98765 43210',
    },
    yearsServing: 15,
    footer: {
      address: '204 Station Road, Andheri East, Mumbai, Maharashtra 400069',
      phone: '+91 98765 43210',
      email: 'care@gabbarhospital.in',
    },
    opdHours: [
      { day: 'Mon – Sat', hours: '9:00 am – 8:00 pm' },
      { day: 'Sunday', hours: '10:00 am – 2:00 pm' },
      { day: 'Emergency', hours: 'Open 24/7' },
    ],
    optionals: {
      services: {
        enabled: 'on',
        orderNumber: 1,
        items: [
          { title: 'Emergency Care', description: '24/7 emergency response and trauma care.', icon: '🚑' },
          { title: 'OPD Consultations', description: 'Walk-in and scheduled specialist visits.', icon: '🩺' },
          { title: 'Diagnostics & Labs', description: 'On-site imaging and same-day lab results.', icon: '🧪' },
          { title: 'Pharmacy', description: 'In-house pharmacy, open through OPD hours.', icon: '💊' },
        ],
      },
      departments: {
        enabled: 'on',
        orderNumber: 2,
        items: [
          { name: 'Cardiology', description: 'Heart care and diagnostics.' },
          { name: 'Pediatrics', description: 'Care for infants and children.' },
          { name: 'Orthopedics', description: 'Bone, joint and sports injury care.' },
          { name: 'Gynecology', description: "Women's health and maternity." },
          { name: 'General Medicine', description: 'Everyday health concerns.' },
          { name: 'ENT', description: 'Ear, nose and throat care.' },
          { name: 'Dermatology', description: 'Skin and hair treatment.' },
          { name: 'Neurology', description: 'Brain and nervous system care.' },
        ],
      },
      doctors: { enabled: 'on', orderNumber: 3, items: [] },
      testimonials: {
        enabled: 'on',
        orderNumber: 4,
        items: [
          {
            name: 'Suresh Patil',
            rating: 5,
            message:
              'The emergency team saw my father within minutes. Calm, fast and clear about every step.',
          },
          {
            name: 'Meera Joshi',
            rating: 5,
            message: 'Booked online, saw Dr. Nair on time, and the reports were ready the same evening.',
          },
          {
            name: 'Arvind Bhatt',
            rating: 5,
            message: 'Clean wards, attentive nurses, and billing that made sense. Highly recommend.',
          },
        ],
      },
    },
    updatedAt: serverTimestamp(),
  },
  { merge: true }
)
console.log(`Updated hospitals/${slug} with hero/emergency/OPD hours/services/departments/testimonials.`)

// --- Doctors (real staff accounts, not fake content) ---
const existingDoctorsSnap = await getDocs(
  query(collection(db, 'users'), where('hospitalId', '==', slug), where('role', '==', 'DOCTOR'))
)

if (existingDoctorsSnap.size > 0) {
  console.log(`\n${existingDoctorsSnap.size} doctor account(s) already exist for this hospital — skipping doctor creation.`)
} else {
  const weekdaysOnly = {
    monday: { available: true, start: '09:00', end: '17:00' },
    tuesday: { available: true, start: '09:00', end: '17:00' },
    wednesday: { available: true, start: '09:00', end: '17:00' },
    thursday: { available: true, start: '09:00', end: '17:00' },
    friday: { available: true, start: '09:00', end: '17:00' },
    saturday: { available: true, start: '09:00', end: '13:00' },
    sunday: { available: false, start: '09:00', end: '13:00' },
  }
  const monWedFriOnly = {
    monday: { available: true, start: '10:00', end: '16:00' },
    tuesday: { available: false, start: '10:00', end: '16:00' },
    wednesday: { available: true, start: '10:00', end: '16:00' },
    thursday: { available: false, start: '10:00', end: '16:00' },
    friday: { available: true, start: '10:00', end: '16:00' },
    saturday: { available: false, start: '10:00', end: '16:00' },
    sunday: { available: false, start: '10:00', end: '16:00' },
  }

  const doctors = [
    { displayName: 'Dr. Ananya Rao', specialization: 'Cardiologist', schedule: weekdaysOnly },
    { displayName: 'Dr. Kavita Nair', specialization: 'Pediatrician', schedule: weekdaysOnly },
    { displayName: 'Dr. Arjun Mehta', specialization: 'Orthopedic Surgeon', schedule: monWedFriOnly },
    { displayName: 'Dr. Sneha Iyer', specialization: 'Gynecologist', schedule: weekdaysOnly },
  ]

  console.log('\nCreating doctor accounts:')
  const credentials = []

  for (const d of doctors) {
    const email = `${d.displayName.toLowerCase().replace('dr. ', '').replace(/\s+/g, '.')}@gabbarhospital.in`
    const password = randomPassword()
    try {
      const uid = await createDoctorAuthAccount(email, password)
      await setDoc(doc(db, 'users', uid), {
        email,
        displayName: d.displayName,
        role: 'DOCTOR',
        hospitalId: slug,
        status: 'active',
        specialization: d.specialization,
        schedule: d.schedule,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'seed-script',
      })
      credentials.push({ name: d.displayName, email, password })
      console.log(`  ✓ ${d.displayName} (${d.specialization}) — ${email}`)
    } catch (err) {
      console.log(`  ✗ ${d.displayName}: ${err.message}`)
    }
  }

  if (credentials.length > 0) {
    console.log('\nDoctor login credentials (save these — shown only once):')
    for (const c of credentials) {
      console.log(`  ${c.name}: ${c.email} / ${c.password}`)
    }
  }
}

console.log('\nDone.')
process.exit(0)
