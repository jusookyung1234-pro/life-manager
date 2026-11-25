import React, { useEffect, useState } from 'react'
import { Card, PriorityBadge, Empty } from './ui'
import { getDayPlan, getCoaching } from '../lib/ai'
import { useStore } from '../lib/store'
import { today } from '../lib/dates'

export function AIPlan({ date }) {
  const { data, update } = useStore()
  const [plan, setPlan] = useState(null)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let alive = true
    setPlan(null)
    getDayPlan(data, date).then((p) => alive && setPlan(p))
    return () => { alive = false }
  }, [data, date, tick])

  const postpone = (t) => update('todos', t.id, { date: plan.carryover.find((c) => c.todo.id === t.id)?.to || t.date })

  return (
    <Card title="✨ AI 하루 계획" action={<button className="btn-ghost !py-1 text-xs" onClick={() => setTick(tick + 1)}>다시 분석</button>} className="bg-gradient-to-br from-lav-50 to-sky2-50">
      {!plan ? (
        <p className="animate-pulse py-6 text-center text-sm text-ink-mute">오늘의 일정과 할 일을 살펴보는 중이에요…</p>
      ) : (
        <div className="space-y-4 text-sm">
          <p className="rounded-2xl bg-white/70 p-3 font-medium">{plan.summary}</p>

          {plan.first && (
            <div>
              <div className="label">🎯 가장 먼저 할 일</div>
              <div className="flex items-center gap-2 rounded-2xl bg-white p-3"><span className="font-medium">{plan.first.title}</span><PriorityBadge p={plan.first.priority} /></div>
            </div>
          )}

          {plan.plan.length > 0 && (
            <div>
              <div className="label">🗓 추천 시간표 (일정 사이 빈 시간 활용)</div>
              <ul className="space-y-1.5">
                {plan.plan.map((o) => (
                  <li key={o.todo.id} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
                    <span className="w-24 shrink-0 text-xs font-medium text-lav-500">{o.start}–{o.end}</span>
                    <span className="truncate">{o.todo.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="label">⏳ 활용 가능한 빈 시간</div>
            {plan.gaps.length ? (
              <div className="flex flex-wrap gap-1.5">
                {plan.gaps.map((g, i) => <span key={i} className="rounded-full bg-white px-2.5 py-1 text-xs">{g.start}–{g.end} ({g.minutes >= 60 ? `${Math.floor(g.minutes / 60)}시간${g.minutes % 60 ? ` ${g.minutes % 60}분` : ''}` : `${g.minutes}분`})</span>)}
              </div>
            ) : <p className="text-xs text-ink-mute">빈 시간이 거의 없어요. 오늘은 바쁜 하루네요.</p>}
          </div>

          {plan.rests.length > 0 && (
            <div>
              <div className="label">☕ 휴식 추천</div>
              <ul className="space-y-1">
                {plan.rests.map((r, i) => <li key={i} className="text-xs text-ink-soft">• {r.at}경 {r.minutes}분 — {r.reason}</li>)}
              </ul>
            </div>
          )}

          {plan.carryover.length > 0 && (
            <div>
              <div className="label">📦 내일로 옮기면 좋을 일</div>
              <ul className="space-y-1.5">
                {plan.carryover.map((c) => (
                  <li key={c.todo.id} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
                    <span className="truncate">{c.todo.title}</span>
                    <button className="btn-primary !px-3 !py-1 text-xs" onClick={() => postpone(c.todo)}>내일로 이동</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export function AICoach() {
  const { data } = useStore()
  const [msgs, setMsgs] = useState(null)
  useEffect(() => {
    let alive = true
    getCoaching(data, today()).then((m) => alive && setMsgs(m))
    return () => { alive = false }
  }, [data])
  return (
    <Card title="💬 AI 생활 코칭">
      {!msgs ? <p className="animate-pulse py-4 text-center text-sm text-ink-mute">기록을 살펴보는 중이에요…</p>
        : msgs.length === 0 ? <Empty title="아직 코칭할 기록이 없어요" desc="습관과 할 일을 기록하면 맞춤 피드백을 드려요." />
        : <ul className="space-y-2">
            {msgs.map((m, i) => (
              <li key={i} className={`flex gap-3 rounded-2xl p-3 text-sm ${m.tone === 'good' ? 'bg-sky2-50' : 'bg-lav-50'}`}>
                <span className="text-xl">{m.icon}</span><span>{m.text}</span>
              </li>
            ))}
          </ul>}
    </Card>
  )
}
