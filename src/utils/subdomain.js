const ROOT_HOSTNAMES = new Set(['localhost', '127.0.0.1'])

// VITE_APP_BASE_URL is the app's own deployed origin (e.g. a *.vercel.app
// URL). Vercel's default domain already has 3+ dot-separated parts
// (foo.vercel.app), which would otherwise be mistaken for a tenant
// subdomain by the parts.length >= 3 check below, so it must be
// recognized as root explicitly.
const APP_BASE_HOSTNAME = (() => {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL
  if (!baseUrl) return ''
  try {
    return new URL(baseUrl).hostname.toLowerCase()
  } catch {
    return ''
  }
})()

/**
 * Resolves the tenant slug from the current URL.
 *
 * Examples:
 *   xyz.com              -> null   (root marketing site)
 *   www.xyz.com          -> null   (root marketing site)
 *   abc.xyz.com          -> "abc"  (tenant)
 *   www.abc.xyz.com      -> "abc"  (tenant, "www" in front is ignored)
 *   localhost            -> null   (root, for local dev)
 *   abc.localhost        -> "abc"  (tenant, for local dev)
 *   foo.vercel.app       -> null   (root, when VITE_APP_BASE_URL is foo.vercel.app)
 *
 * A `?tenant=abc` query param always wins, so a tenant site can be
 * previewed on plain `localhost` without configuring hosts/DNS.
 */
export function getTenantSlug(location = window.location) {
  const override = new URLSearchParams(location.search).get('tenant')
  if (override) return override.toLowerCase()

  const hostname = location.hostname.toLowerCase()

  if (ROOT_HOSTNAMES.has(hostname)) return null
  if (APP_BASE_HOSTNAME && hostname === APP_BASE_HOSTNAME) return null

  let parts = hostname.split('.')

  // A leading "www" is just a convention, not a tenant slug — drop it so
  // www.abc.xyz.com resolves the same way as abc.xyz.com.
  if (parts[0] === 'www') {
    parts = parts.slice(1)
  }

  if (parts.length >= 3) {
    return parts[0]
  }

  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0]
  }

  return null
}
