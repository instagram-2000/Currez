// Generates public/sitemap.xml covering the root marketing domain AND
// every active hospital subdomain + their active doctors — a single static
// file, built once here rather than served live per-request, so it works
// identically on any static host (no edge/serverless function needed, and
// no code to rewrite when moving off Vercel later).
//
// Cross-subdomain URLs in one sitemap are only accepted by Google if
// currez.in is verified in Search Console as a Domain property (not a
// URL-prefix property) — Domain verification covers every subdomain at
// once, which is exactly what this file assumes.
//
// Run with: npm run generate-sitemap (before deploying — this reads
// Firestore, it isn't wired into `build` automatically, so a deploy never
// pays for this read unless you ask it to).
import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'

const ROOT_DOMAIN = 'currez.in'

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

function urlEntry(loc, { changefreq, priority } = {}) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')
}

async function main() {
  const hospitalsSnap = await getDocs(
    query(collection(db, 'hospitals'), where('status', '==', 'active'))
  )

  const entries = [urlEntry(`https://www.${ROOT_DOMAIN}/`, { changefreq: 'weekly', priority: '1.0' })]

  for (const hospitalDoc of hospitalsSnap.docs) {
    const slug = hospitalDoc.id
    const hospitalUrl = `https://${slug}.${ROOT_DOMAIN}`
    entries.push(urlEntry(`${hospitalUrl}/`, { changefreq: 'weekly', priority: '0.9' }))

    const doctorsSnap = await getDocs(
      query(
        collection(db, 'users'),
        where('hospitalId', '==', slug),
        where('role', '==', 'DOCTOR'),
        where('status', '==', 'active')
      )
    )
    for (const doctorDoc of doctorsSnap.docs) {
      // No ?tenant= query param here — the subdomain itself already
      // resolves the tenant in production, and this must match exactly
      // what DoctorProfilePage's own canonical tag declares (see
      // useSeoMeta's window.location.origin + pathname, no search string).
      entries.push(
        urlEntry(`${hospitalUrl}/doctor/${doctorDoc.id}`, {
          changefreq: 'monthly',
          priority: '0.6',
        })
      )
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n')

  writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml)
  console.log(`Wrote public/sitemap.xml with ${entries.length} URLs (${hospitalsSnap.size} active hospitals).`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to generate sitemap:', err)
    process.exit(1)
  })
