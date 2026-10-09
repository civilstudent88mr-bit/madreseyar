const crypto = require('node:crypto')

const COOKIE_NAME = 'healthcare_admin_session'
const MAX_AGE_SECONDS = 8 * 60 * 60

function signature(timestamp) {
  return crypto.createHmac('sha256', process.env.AI_ADMIN_SECRET).update(`healthcare-admin:${timestamp}`).digest('hex')
}

function cookieValue(header = '') {
  const entry = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))
  return entry ? decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)) : ''
}

function isAdmin(req) {
  if (!process.env.AI_ADMIN_SECRET) return false
  const [timestamp, supplied] = cookieValue(req.headers.cookie).split('.')
  if (!/^\d+$/.test(timestamp || '') || !supplied) return false
  const issued = Number(timestamp)
  const now = Math.floor(Date.now() / 1000)
  if (!Number.isSafeInteger(issued) || issued > now || now - issued > MAX_AGE_SECONDS) return false
  const expected = Buffer.from(signature(timestamp), 'hex')
  const actual = Buffer.from(supplied, 'hex')
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
}

function setAdminCookie(res) {
  const timestamp = String(Math.floor(Date.now() / 1000))
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${timestamp}.${signature(timestamp)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE_SECONDS}`)
}

function clearAdminCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`)
}

module.exports = { isAdmin, setAdminCookie, clearAdminCookie }
