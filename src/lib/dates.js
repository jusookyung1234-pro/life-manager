export const pad = (n) => String(n).padStart(2, '0')
export const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const today = () => fmt(new Date())
export const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return fmt(d) }
export const DOW = ['일', '월', '화', '수', '목', '금', '토']
export const dow = (s) => DOW[parse(s).getDay()]
export const label = (s) => { const d = parse(s); return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW[d.getDay()]})` }
export const weekStart = (s) => addDays(s, -((parse(s).getDay() + 6) % 7)) // 월요일 시작
export const weekDays = (s) => { const st = weekStart(s); return Array.from({ length: 7 }, (_, i) => addDays(st, i)) }
export const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
export const toTime = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
export const uid = () => Math.random().toString(36).slice(2, 10)
