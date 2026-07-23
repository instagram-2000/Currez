// Avoids visually ambiguous characters (0/O, 1/I) since patients read this
// off a screen and repeat it back at the front desk.
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

// Generates a human-readable appointment token in APT-XXXX-XXXX format.
// The prefix makes it immediately clear what the code is for, and the
// grouped characters are easier to read aloud at the front desk.
export function generateToken() {
  const bytes = new Uint32Array(8)
  crypto.getRandomValues(bytes)
  const chars = Array.from(bytes, (byte) => CHARS[byte % CHARS.length])
  return `APT-${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}`
}
