import { addDays, weekDays, dow, toMin } from './dates'

export const todosOn = (data, date) => data.todos.filter((t) => t.date === date)
export const eventsOn = (data, date) => data.events.filter((e) => e.date === date).sort((a, b) => toMin(a.start) - toMin(b.start))
export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)

export function todoRate(data, date) {
  const l = todosOn(data, date)
  return { total: l.length, done: l.filter((t) => t.done).length, rate: pct(l.filter((t) => t.done).length, l.length) }
}
export function habitRate(data, date) {
  const total = data.habits.length
  const done = (data.habitLogs[date] || []).filter((id) => data.habits.some((h) => h.id === id)).length
  return { total, done, rate: pct(done, total) }
}
export const isHabitDone = (data, date, id) => (data.habitLogs[date] || []).includes(id)

// 연속 달성일: 오늘 미체크여도 어제까지의 연속 기록은 유지
export function streak(data, id, from) {
  let d = from
  if (!isHabitDone(data, d, id)) d = addDays(d, -1)
  let n = 0
  while (isHabitDone(data, d, id) && n < 400) { n++; d = addDays(d, -1) }
  return n
}

export const workoutsOn = (data, date) => data.workouts.filter((w) => w.date === date)
export const studyMinutes = (data, date, subjectId) =>
  data.studyLogs.filter((s) => s.date === date && (!subjectId || s.subjectId === subjectId)).reduce((a, s) => a + s.minutes, 0)

export function weekStats(data, anchor) {
  return weekDays(anchor).map((date) => {
    const t = todoRate(data, date)
    const h = habitRate(data, date)
    const ws = workoutsOn(data, date).filter((w) => w.done)
    return {
      date, name: dow(date), todoDone: t.done, todoTotal: t.total, habitRate: h.rate,
      workouts: ws.length, workoutMin: ws.reduce((a, w) => a + w.minutes, 0), study: studyMinutes(data, date),
      score: t.done * 2 + Math.round(h.rate / 25) + ws.length * 2 + Math.round(studyMinutes(data, date) / 30),
    }
  })
}

// 겹치는 일정 id 집합
export function overlapIds(events) {
  const ids = new Set()
  for (let i = 0; i < events.length; i++)
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i], b = events[j]
      if (toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end)) { ids.add(a.id); ids.add(b.id) }
    }
  return ids
}
