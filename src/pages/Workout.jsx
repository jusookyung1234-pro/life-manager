import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, PageHeader, Ring, Empty, Modal, Field, Stat } from '../components/ui'
import { useStore } from '../lib/store'
import { today, weekDays, dow, label } from '../lib/dates'
import { WORKOUT_TYPES } from '../lib/sample'
import { pct } from '../lib/stats'

export default function Workout() {
  const { data, add, update, remove, patch } = useStore()
  const t = today()
  const [modal, setModal] = useState(null)
  const [f, setF] = useState({ type: WORKOUT_TYPES[0], custom: '', minutes: 30, date: t })
  const wk = weekDays(t)
  const goal = data.profile.workoutGoal || 3
  const inWeek = data.workouts.filter((w) => wk.includes(w.date))
  const doneW = inWeek.filter((w) => w.done)
  const minutes = doneW.reduce((a, w) => a + w.minutes, 0)
  const rate = Math.min(100, pct(doneW.length, goal))
  const chart = wk.map((d) => ({ name: dow(d), 분: data.workouts.filter((w) => w.date === d && w.done).reduce((a, w) => a + w.minutes, 0) }))
  const recent = [...data.workouts].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30)

  const open = (w) => { setF(w ? { type: WORKOUT_TYPES.includes(w.type) ? w.type : '직접 입력', custom: WORKOUT_TYPES.includes(w.type) ? '' : w.type, minutes: w.minutes, date: w.date } : { type: WORKOUT_TYPES[0], custom: '', minutes: 30, date: t }); setModal({ w }) }
  const submit = (e) => {
    e.preventDefault()
    const type = f.type === '직접 입력' ? f.custom.trim() : f.type
    if (!type || f.minutes <= 0) return
    const rec = { type, minutes: Number(f.minutes), date: f.date }
    modal.w ? update('workouts', modal.w.id, rec) : add('workouts', { ...rec, done: f.date <= t })
    setModal(null)
  }

  return (
    <div>
      <PageHeader title="운동 관리" desc="무리하지 않고 꾸준하게, 몸을 움직여요.">
        <button className="btn-primary" onClick={() => open(null)}>＋ 운동 기록</button>
      </PageHeader>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="주간 목표">
          <div className="flex flex-col items-center gap-3">
            <Ring value={rate} size={150} color="#74aadb" label={`${doneW.length}/${goal}회`} sub={`${rate}% 달성`} />
            <div className="flex items-center gap-2 text-xs text-ink-soft">주 목표
              <button className="btn-ghost !px-2 !py-0.5" onClick={() => patch((d) => ({ profile: { ...d.profile, workoutGoal: Math.max(1, goal - 1) } }))} aria-label="목표 줄이기">−</button>
              <b className="text-ink">{goal}회</b>
              <button className="btn-ghost !px-2 !py-0.5" onClick={() => patch((d) => ({ profile: { ...d.profile, workoutGoal: Math.min(14, goal + 1) } }))} aria-label="목표 늘리기">＋</button>
            </div>
            <div className="grid w-full grid-cols-2 gap-2"><Stat icon="🏃" label="이번 주 횟수" value={`${doneW.length}회`} /><Stat icon="⏱" label="총 운동 시간" value={`${minutes}분`} tint="bg-sky2-50" /></div>
          </div>
        </Card>
        <Card title="요일별 운동 시간" className="lg:col-span-2">
          <div className="h-52"><ResponsiveContainer><BarChart data={chart} margin={{ left: -20 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="분" />
            <Tooltip cursor={{ fill: '#f6f3fc' }} /><Bar dataKey="분" fill="#9cc5ea" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Card>
      </div>

      <Card title="운동 기록" className="mt-5">
        {recent.length === 0 ? <Empty icon="👟" title="아직 운동 기록이 없어요" desc="15분 산책도 훌륭한 시작이에요." action={<button className="btn-primary" onClick={() => open(null)}>첫 운동 기록하기</button>} /> : (
          <ul className="space-y-2">
            {recent.map((w) => (
              <li key={w.id} className="flex items-center gap-3 rounded-2xl bg-cream-50 px-3 py-2.5">
                <input type="checkbox" checked={w.done} onChange={() => update('workouts', w.id, { done: !w.done })} className="h-5 w-5 accent-lav-400" aria-label={`${w.type} 완료`} />
                <div className="flex-1"><div className={`text-sm font-medium ${w.done ? '' : 'text-ink-soft'}`}>{w.type} · {w.minutes}분</div><div className="text-[11px] text-ink-mute">{label(w.date)} {w.done ? '· 완료' : '· 예정'}</div></div>
                <button className="btn-ghost !px-2 !py-1" onClick={() => open(w)} aria-label="수정">✏️</button>
                <button className="btn-danger !px-2 !py-1" onClick={() => remove('workouts', w.id)} aria-label="삭제">🗑</button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.w ? '운동 수정' : '운동 기록'}>
        <form onSubmit={submit}>
          <Field label="운동 종류"><select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{[...WORKOUT_TYPES, '직접 입력'].map((x) => <option key={x}>{x}</option>)}</select></Field>
          {f.type === '직접 입력' && <Field label="운동 이름"><input className="input" value={f.custom} onChange={(e) => setF({ ...f, custom: e.target.value })} /></Field>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="시간(분)"><input type="number" min="1" className="input" value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value })} /></Field>
            <Field label="날짜"><input type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          </div>
          <button className="btn-primary mt-2 w-full">저장하기</button>
        </form>
      </Modal>
    </div>
  )
}
