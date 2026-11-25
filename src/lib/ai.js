// ─────────────────────────────────────────────────────────────
// AI 매니저 서비스 계층
// 지금은 규칙 기반 "시뮬레이션"이지만, UI는 이 두 함수만 호출합니다.
// 실제 AI API(예: Claude)를 연결할 때는 아래 provider 부분만 교체하세요.
//   const res = await fetch('/api/plan', { method: 'POST', body: JSON.stringify({ data, date }) })
//   return res.json()   // getDayPlan 과 같은 형태의 객체를 돌려주면 UI는 그대로 동작합니다.
// ─────────────────────────────────────────────────────────────
import { toMin, toTime, addDays, weekDays } from './dates'
import { eventsOn, todosOn, weekStats, streak, habitRate } from './stats'
import { PRIORITIES } from './sample'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))
const RANK = { high: 0, mid: 1, low: 2 }
const DAY_START = 8 * 60
const DAY_END = 22 * 60

function localDayPlan(data, date) {
  const pending = todosOn(data, date).filter((t) => !t.done).sort((a, b) => RANK[a.priority] - RANK[b.priority])
  const events = eventsOn(data, date)

  // 일정 사이 빈 시간
  const gaps = []
  let cursor = DAY_START
  events.forEach((e) => {
    const s = toMin(e.start)
    if (s - cursor >= 30) gaps.push({ start: toTime(cursor), end: toTime(s), minutes: s - cursor })
    cursor = Math.max(cursor, toMin(e.end))
  })
  if (DAY_END - cursor >= 30) gaps.push({ start: toTime(cursor), end: toTime(DAY_END), minutes: DAY_END - cursor })

  // 빈 시간에 할 일 배치 (중요한 일부터, 한 건당 기본 30~60분)
  const queue = [...pending]
  const order = []
  const slots = gaps.map((g) => ({ ...g, left: g.minutes, cur: toMin(g.start) }))
  slots.forEach((s) => {
    while (queue.length && s.left >= 30) {
      const t = queue[0]
      const need = t.priority === 'high' ? 60 : 30
      const use = Math.min(need, s.left)
      order.push({ todo: t, start: toTime(s.cur), end: toTime(s.cur + use) })
      s.cur += use; s.left -= use; queue.shift()
    }
  })
  const overflow = queue // 시간이 부족해 못 넣은 일

  // 휴식 제안: 연속 일정 2시간 이상 뒤, 그리고 긴 빈 시간 중간
  const rests = []
  let run = 0, runEnd = 0
  events.forEach((e) => {
    const s = toMin(e.start), en = toMin(e.end)
    run = s - runEnd <= 15 && runEnd ? run + (en - s) : en - s
    runEnd = Math.max(runEnd, en)
    if (run >= 120) rests.push({ at: toTime(en), minutes: 15, reason: '집중 일정이 2시간 이상 이어졌어요' })
  })
  const lunch = gaps.find((g) => toMin(g.start) <= 13 * 60 && toMin(g.end) >= 12 * 60 + 30)
  if (lunch) rests.push({ at: toTime(Math.max(toMin(lunch.start), 12 * 60)), minutes: 30, reason: '점심 후 잠깐 쉬어가요' })
  if (!rests.length && events.length === 0) rests.push({ at: '15:00', minutes: 15, reason: '오후에 가볍게 스트레칭해요' })

  const isToday = true
  const tomorrow = addDays(date, 1)
  const carryover = [...overflow, ...pending.filter((t) => t.priority === 'low' && !order.some((o) => o.todo.id === t.id))]
  const uniq = [...new Map(carryover.map((t) => [t.id, t])).values()]

  return {
    date, isToday,
    first: pending[0] || null,
    priorityOrder: pending,
    plan: order,
    gaps,
    rests,
    carryover: uniq.map((t) => ({ todo: t, to: tomorrow })),
    summary: pending.length
      ? `오늘 남은 일은 ${pending.length}개예요. '${pending[0].title}'(${PRIORITIES[pending[0].priority]})부터 시작해 보세요.`
      : '오늘 할 일을 모두 마쳤어요. 정말 수고했어요! 🎉',
  }
}

function localCoaching(data, today) {
  const msgs = []
  // 1) 연속 달성 습관 칭찬
  const best = data.habits.map((h) => ({ h, n: streak(data, h.id, today) })).sort((a, b) => b.n - a.n)[0]
  if (best && best.n >= 3) msgs.push({ tone: 'good', icon: best.h.icon, text: `'${best.h.name}' 습관을 ${best.n}일째 꾸준히 실천 중이에요! 이 흐름 멋져요.` })

  // 2) 운동
  const wk = weekStats(data, today)
  const days = wk.filter((d) => d.date <= today)
  const wDone = days.reduce((a, d) => a + d.workouts, 0)
  const goal = data.profile.workoutGoal || 3
  if (wDone === 0) msgs.push({ tone: 'tip', icon: '🚶', text: '이번 주엔 아직 운동 기록이 없어요. 오늘은 15분 산책부터 시작해 볼까요?' })
  else if (wDone < goal) msgs.push({ tone: 'tip', icon: '💪', text: `이번 주 운동 ${wDone}회, 목표까지 ${goal - wDone}회 남았어요. 가볍게 이어가 봐요.` })
  else msgs.push({ tone: 'good', icon: '🏅', text: `이번 주 운동 목표(${goal}회)를 달성했어요! 몸이 고마워할 거예요.` })

  // 3) 시간대 분석 (완료 시각이 기록된 할 일)
  const timed = data.todos.filter((t) => t.done && typeof t.doneHour === 'number')
  const pm = timed.filter((t) => t.doneHour >= 12).length
  if (timed.length >= 4) {
    msgs.push(pm >= timed.length / 2
      ? { tone: 'tip', icon: '🌤️', text: '오후 시간대에 할 일 완료율이 높아요. 중요한 일을 오후에 배치해 보는 건 어떨까요?' }
      : { tone: 'tip', icon: '🌅', text: '오전에 할 일을 많이 끝내고 있어요. 어려운 일은 오전에 먼저 해 보세요.' })
  } else msgs.push({ tone: 'tip', icon: '🌤️', text: '할 일을 체크할수록 나에게 맞는 집중 시간대를 알려드릴 수 있어요.' })

  // 4) 오늘 습관
  const hr = habitRate(data, today)
  if (data.habits.length && hr.rate < 50) msgs.push({ tone: 'tip', icon: '🌱', text: `오늘 습관 달성률이 ${hr.rate}%예요. 가장 쉬운 습관 하나만 먼저 체크해 볼까요?` })
  const lowHabit = data.habits.map((h) => ({ h, c: weekDays(today).filter((d) => (data.habitLogs[d] || []).includes(h.id)).length })).sort((a, b) => a.c - b.c)[0]
  if (lowHabit && lowHabit.c <= 1) msgs.push({ tone: 'tip', icon: lowHabit.h.icon, text: `이번 주 '${lowHabit.h.name}'을(를) ${lowHabit.c}번만 했어요. 하루 5분부터 다시 시작해요.` })
  return msgs.slice(0, 5)
}

// ── 공개 API (비동기: 실제 API 호출로 바꿔도 UI 변경 없음) ──
export async function getDayPlan(data, date) { await delay(450); return localDayPlan(data, date) }
export async function getCoaching(data, today) { await delay(350); return localCoaching(data, today) }
