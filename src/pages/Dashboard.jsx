import React, { useEffect, useState } from 'react'
import { Card, Ring, Stat, Empty, PriorityBadge, Bar } from '../components/ui'
import { AIPlan, AICoach } from '../components/AIPanels'
import { TodoItem } from '../components/TodoParts'
import { useStore } from '../lib/store'
import { today, label, dow, pad } from '../lib/dates'
import { PRIORITIES } from '../lib/sample'
import { todoRate, habitRate, eventsOn, todosOn, workoutsOn, studyMinutes, overlapIds, pct } from '../lib/stats'

function greeting(h, name) {
  const w = h < 6 ? '늦은 밤이에요' : h < 12 ? '좋은 아침이에요' : h < 18 ? '좋은 오후예요' : '편안한 저녁이에요'
  return `${name ? name + '님, ' : ''}${w} ☺️`
}

export default function Dashboard() {
  const { data, update, remove, setDailyGoal, patch } = useStore()
  const t = today()
  const [now, setNow] = useState(new Date())
  useEffect(() => { const i = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(i) }, [])
  const [goalEdit, setGoalEdit] = useState(false)
  const [goal, setGoal] = useState(data.dailyGoal[t] || '')

  const tr = todoRate(data, t)
  const hr = habitRate(data, t)
  const todos = todosOn(data, t)
  const events = eventsOn(data, t)
  const overlaps = overlapIds(events)
  const wGoalDone = workoutsOn(data, t).filter((w) => w.done).length
  const dayGoals = [
    { l: '할 일', v: tr.rate }, { l: '습관', v: hr.rate },
    { l: '운동', v: workoutsOn(data, t).length ? pct(wGoalDone, workoutsOn(data, t).length) : 0 },
  ]
  const overall = Math.round(dayGoals.reduce((a, g) => a + g.v, 0) / dayGoals.length)
  const study = studyMinutes(data, t)
  const empty = !data.todos.length && !data.events.length && !data.habits.length

  const saveGoal = () => { setDailyGoal(t, goal.trim()); setGoalEdit(false) }

  return (
    <div className="space-y-5">
      {/* 상단 */}
      <div className="card bg-gradient-to-br from-lav-100 via-white to-sky2-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm text-ink-soft">{label(t)} · {dow(t)}요일</div>
            <h1 className="mt-1 text-2xl font-bold">{greeting(now.getHours(), data.profile.name)}</h1>
          </div>
          <div className="rounded-2xl bg-white/80 px-4 py-2 text-2xl font-bold tabular-nums text-lav-500" aria-label="현재 시간">
            {pad(now.getHours())}:{pad(now.getMinutes())}<span className="text-sm text-ink-mute">:{pad(now.getSeconds())}</span>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-white/70 p-3">
          <div className="label">🎯 오늘의 핵심 목표</div>
          {goalEdit ? (
            <div className="flex gap-2">
              <input autoFocus className="input" value={goal} onChange={(e) => setGoal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveGoal()} placeholder="오늘 가장 이루고 싶은 한 가지" />
              <button className="btn-primary" onClick={saveGoal}>저장</button>
            </div>
          ) : (
            <button className="w-full text-left text-sm font-medium" onClick={() => { setGoal(data.dailyGoal[t] || ''); setGoalEdit(true) }}>
              {data.dailyGoal[t] || <span className="text-ink-mute">탭해서 오늘의 목표를 적어보세요 ✏️</span>}
            </button>
          )}
        </div>
      </div>

      {empty && (
        <Empty icon="🌱" title="아직 기록이 비어 있어요" desc="할 일·일정·습관을 추가하거나 샘플 데이터로 둘러보세요."
          action={<a href="#/settings" className="btn-primary">설정에서 샘플 불러오기</a>} />
      )}

      {/* 요약 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon="📝" label="오늘 할 일" value={`${tr.total}개`} tint="bg-lav-50" />
        <Stat icon="✅" label="완료" value={`${tr.done}개`} tint="bg-sky2-50" />
        <Stat icon="📈" label="달성률" value={`${tr.rate}%`} tint="bg-cream-200" />
        <Stat icon="📅" label="오늘 일정" value={`${events.length}건`} tint="bg-lav-50" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* 진행 상황 */}
        <Card title="오늘의 진행 상황" className="lg:col-span-1">
          <div className="flex justify-center"><Ring value={tr.rate} size={150} stroke={14} sub="할 일 완료" /></div>
          <div className="mt-4 space-y-3">
            <div><div className="mb-1 flex justify-between text-xs"><span>🌱 습관 달성률 ({hr.done}/{hr.total})</span><b>{hr.rate}%</b></div><Bar value={hr.rate} color="bg-sky2-300" /></div>
            <div><div className="mb-1 flex justify-between text-xs"><span>🎯 하루 목표 종합</span><b>{overall}%</b></div><Bar value={overall} color="bg-lav-400" /></div>
            <div className="flex justify-between text-xs text-ink-soft"><span>🏃 운동 {wGoalDone}회 완료</span><span>📚 공부 {study}분</span></div>
          </div>
        </Card>

        {/* 일정 요약 */}
        <Card title="오늘의 일정" action={<a href="#/schedule" className="text-xs text-lav-500">전체 보기 ›</a>} className="lg:col-span-2">
          {events.length === 0 ? <Empty icon="☁️" title="오늘 예정된 일정이 없어요" action={<a href="#/schedule" className="btn-primary">일정 추가하기</a>} /> : (
            <ul className="space-y-2">
              {events.map((e) => (
                <li key={e.id} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${overlaps.has(e.id) ? 'bg-rose-50 ring-1 ring-rose-200' : 'bg-cream-50'}`}>
                  <span className="w-28 shrink-0 text-xs font-medium text-lav-500">{e.start}–{e.end}</span>
                  <span className="flex-1 truncate text-sm">{e.title}</span>
                  {overlaps.has(e.id) && <span className="text-[11px] text-rose-500">⚠ 겹침</span>}
                  <PriorityBadge p={e.priority} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* 우선순위별 할 일 */}
      <Card title="오늘의 우선순위" action={<a href="#/todos" className="text-xs text-lav-500">할 일 관리 ›</a>}>
        {todos.length === 0 ? <Empty icon="🍃" title="오늘 할 일이 없어요" desc="여유로운 하루네요. 새 할 일을 추가해 보세요." action={<a href="#/todos" className="btn-primary">할 일 추가</a>} /> : (
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(PRIORITIES).map(([k, name]) => {
              const list = todos.filter((x) => x.priority === k)
              return (
                <div key={k}>
                  <div className="mb-2 flex items-center gap-2"><PriorityBadge p={k} /><span className="text-xs text-ink-mute">{list.filter((x) => x.done).length}/{list.length}</span></div>
                  {list.length === 0 ? <p className="rounded-2xl bg-cream-50 p-3 text-center text-xs text-ink-mute">없음</p>
                    : <ul className="space-y-2">{list.map((x) => <TodoItem key={x.id} t={x} update={update} remove={remove} />)}</ul>}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <AIPlan date={t} />
        <AICoach />
      </div>
    </div>
  )
}
