import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, PageHeader, Ring, Empty, Modal, Field } from '../components/ui'
import { useStore } from '../lib/store'
import { today, addDays, weekDays, dow, fmt, parse } from '../lib/dates'
import { habitRate, isHabitDone, streak, pct } from '../lib/stats'

const ICONS = ['💧', '📖', '🧘', '🏃', '✏️', '🌙', '🍎', '🧹', '🎧', '🙏', '💊', '☀️']

export default function Habits() {
  const { data, add, remove, toggleHabit } = useStore()
  const t = today()
  const [view, setView] = useState('week')
  const [modal, setModal] = useState(false)
  const [f, setF] = useState({ name: '', icon: ICONS[0] })
  const hr = habitRate(data, t)
  const wk = weekDays(t)
  const month = Array.from({ length: 30 }, (_, i) => addDays(t, i - 29))
  const range = view === 'week' ? wk : month

  const chart = data.habits.map((h) => ({
    name: h.name.length > 6 ? h.name.slice(0, 6) + '…' : h.name,
    rate: pct(range.filter((d) => isHabitDone(data, d, h.id)).length, range.length),
  }))
  const submit = (e) => { e.preventDefault(); if (!f.name.trim()) return; add('habits', { name: f.name.trim(), icon: f.icon }); setF({ name: '', icon: ICONS[0] }); setModal(false) }

  return (
    <div>
      <PageHeader title="습관 관리" desc="작은 체크가 쌓여 나를 만들어요.">
        <button className="btn-primary" onClick={() => setModal(true)}>＋ 습관 추가</button>
      </PageHeader>

      {data.habits.length === 0 ? (
        <Empty icon="🌱" title="아직 등록한 습관이 없어요" desc="물 마시기, 독서처럼 작은 습관부터 시작해 보세요." action={<button className="btn-primary" onClick={() => setModal(true)}>첫 습관 만들기</button>} />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <Card title="오늘의 습관" className="lg:col-span-2">
              <ul className="space-y-2">
                {data.habits.map((h) => {
                  const on = isHabitDone(data, t, h.id)
                  const s = streak(data, h.id, t)
                  return (
                    <li key={h.id} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${on ? 'bg-sky2-50' : 'bg-cream-50'}`}>
                      <button onClick={() => toggleHabit(t, h.id)} aria-pressed={on} aria-label={`${h.name} ${on ? '해제' : '완료'}`}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg transition ${on ? 'bg-sky2-400 text-white' : 'bg-white text-ink-mute ring-1 ring-lav-100'}`}>{on ? '✓' : h.icon}</button>
                      <div className="flex-1"><div className={`text-sm font-medium ${on ? 'text-ink-soft' : ''}`}>{h.icon} {h.name}</div>
                        <div className="text-[11px] text-ink-mute">🔥 연속 {s}일</div></div>
                      <button className="btn-danger !px-2 !py-1 text-xs" onClick={() => { if (confirm(`'${h.name}' 습관을 삭제할까요?`)) remove('habits', h.id) }} aria-label="습관 삭제">🗑</button>
                    </li>
                  )
                })}
              </ul>
            </Card>
            <Card title="오늘 달성률"><div className="flex flex-col items-center gap-2"><Ring value={hr.rate} size={150} color="#74aadb" sub={`${hr.done}/${hr.total}`} /><p className="text-xs text-ink-soft">{hr.rate === 100 ? '오늘 습관 완벽 달성! 🌟' : '하나씩 체크해 보세요.'}</p></div></Card>
          </div>

          <div className="flex gap-2">
            {[['week', '주간'], ['month', '월간']].map(([k, v]) => <button key={k} onClick={() => setView(k)} className={`rounded-full px-4 py-1.5 text-sm font-medium ${view === k ? 'bg-lav-400 text-white' : 'bg-white text-ink-soft'}`}>{v} 기록</button>)}
          </div>

          <Card title={view === 'week' ? '이번 주 기록' : '최근 30일 기록'}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-center text-xs">
                <thead><tr><th className="p-1 text-left font-medium text-ink-mute">습관</th>
                  {range.map((d) => <th key={d} className={`p-0.5 font-normal ${d === t ? 'font-bold text-lav-500' : 'text-ink-mute'}`}>{view === 'week' ? dow(d) : Number(d.slice(8))}</th>)}</tr></thead>
                <tbody>
                  {data.habits.map((h) => (
                    <tr key={h.id}><td className="whitespace-nowrap p-1 text-left">{h.icon} {view === 'week' ? h.name : ''}</td>
                      {range.map((d) => (
                        <td key={d} className="p-0.5">
                          <button onClick={() => d <= t && toggleHabit(d, h.id)} disabled={d > t} aria-label={`${h.name} ${d}`}
                            className={`mx-auto block rounded-md ${view === 'week' ? 'h-7 w-7' : 'h-4 w-4'} ${isHabitDone(data, d, h.id) ? 'bg-sky2-300' : d > t ? 'bg-transparent' : 'bg-lav-50'}`} />
                        </td>
                      ))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title={`습관별 달성률 (${view === 'week' ? '이번 주' : '최근 30일'})`}>
            <div className="h-60">
              <ResponsiveContainer>
                <BarChart data={chart} margin={{ left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip formatter={(v) => `${v}%`} cursor={{ fill: '#f6f3fc' }} />
                  <Bar dataKey="rate" name="달성률" radius={[10, 10, 0, 0]}>{chart.map((_, i) => <Cell key={i} fill={i % 2 ? '#9cc5ea' : '#c0b0e6'} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="새 습관">
        <form onSubmit={submit}>
          <Field label="습관 이름"><input autoFocus className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="예: 감사 일기 쓰기" /></Field>
          <Field label="아이콘"><div className="flex flex-wrap gap-2">{ICONS.map((i) => <button type="button" key={i} onClick={() => setF({ ...f, icon: i })} className={`h-10 w-10 rounded-2xl text-xl ${f.icon === i ? 'bg-lav-200 ring-2 ring-lav-400' : 'bg-cream-100'}`}>{i}</button>)}</div></Field>
          <button className="btn-primary mt-2 w-full">추가하기</button>
        </form>
      </Modal>
    </div>
  )
}
