export function formatSiteTime(now: Date, offset = '+08:00') {
  const match = /^([+-])(\d{2}):(\d{2})$/.exec(offset.trim())
  const minutes = match && Number(match[2]) <= 14 && Number(match[3]) < 60 && (Number(match[2]) < 14 || match[3] === '00')
    ? (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) : 480
  return new Date(now.getTime() + minutes * 60000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })
}
