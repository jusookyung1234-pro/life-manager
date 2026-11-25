import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, PageHeader, Empty, Modal, Field, Bar as Progress } from '../components/ui'
import { useStore } from '../lib/store'
import { today, weekDays, dow } from '../lib/dates'
import { pct } from '../lib/stats'

export default function Study() {
  const { data, add, update, remove } = useStore()
  const t = today()
  const wk = weekDays(t)
  const [subModal, setSubModal] = useState(null)
  const [sf, setSf] = useState({ name: '', weeklyGoal: 120 })
  const [logModal, setLogModal] = useState(null) // subject
  const [lf, setLf] = useState({ minutes: 30, date: t })

  const weekMin = (id) => data.studyLogs.filter((l) => l.subjectId === id && wk.includes(l.date)).reduce((a, l) => a + l.minutes, 0)
  const total = data.studyLogs.filter((l) => wk.includes(l.date)).reduce((a, l) => a + l.minutes, 0)
  const goalTotal = data.subjects.reduce((a, s) => a + Number(s.weeklyGoal), 0)
  const chart = wk.map((d) => ({ name: dow(d), 분: data.studyLogs.filter((l) => l.date === d).reduce((a, l) => a + l.minutes, 0) }))
  const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ''}` : `${m}분`)

  const openSub = (s) => { setSf(s ? { name: s.name, weeklyGoal: s.weeklyGoal } : { name: '', weeklyGoal: 120 }); setSubModal({ s }) }
  const saveSub = (e) => {
    e.preventDefault(); if (!sf.name.trim()) return
    const rec = { name: sf.name.trim(), weeklyGoal: Number(sf.weeklyGoal) || 0 }
    subModal.s ? update('subjects', subModal.s.id, rec) : add('subjects', { ...rec, progress: 0 })
    setSubModal(null)
  }
  const saveLog = (e) => { e.preventDefault(); if (Number(lf.minutes) <= 0) return; add('studyLogs', { subjectId: logModal.id, minutes: Number(lf.minutes), date: lf.date }); setLogModal(null) }

  return (
    <div>
      <PageHeader title="자기계발" desc="목표 시간과 진도를 함께 관리해요.">
        <button className="btn-primary" onClick={() => openSub(null)}>＋ 분야 추가</button>
      </PageHeader>

      {data.subjects.length === 0 ? (
        <Empty icon="📚" title="공부할 분야를 등록해 보세요" desc="영어, 코딩, 독서 등 키우고 싶은 분야를 추가해요." action={<button className="btn-primary" onClick={() => openSub(null)}>분야 추가</button>} />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <Card title="이번 주 학습 시간" className="lg:col-span-1">
              <div className="text-3xl font-bold">{fmtMin(total)}</div>
              <p className="mb-3 text-xs text-ink-mute">주간 목표 {fmtMin(goalTotal)} · {pct(total, goalTotal)}%</p>
              <Progress value={pct(total, goalTotal)} color="bg-sky2-300" />
            </Card>
            <Card title="요일별 학습 시간" className="lg:col-span-2">
              <div className="h-44"><ResponsiveContainer><BarChart data={chart} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="분" />
                <Tooltip cursor={{ fill: '#f6f3fc' }} /><Bar dataKey="분" fill="#c0b0e6" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer></div>
            </Card>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {data.subjects.map((s) => {
              const m = weekMin(s.id)
              return (
                <Card key={s.id} title={`📖 ${s.name}`} action={<div className="flex gap-1"><button className="btn-ghost !px-2 !py-1" onClick={() => openSub(s)} aria-label="수정">✏️</button><button className="btn-danger !px-2 !py-1" onClick={() => { if (confirm(`'${s.name}'과(와) 학습 기록을 삭제할까요?`)) { remove('subjects', s.id); data.studyLogs.filter((l) => l.subjectId === s.id).forEach((l) => remove('studyLogs', l.id)) } }} aria-label="삭제">🗑</button></div>}>
                  <div className="mb-1 flex justify-between text-xs"><span>이번 주 {fmtMin(m)} / 목표 {fmtMin(Number(s.weeklyGoal))}</span><b>{pct(m, s.weeklyGoal)}%</b></div>
                  <Progress value={pct(m, s.weeklyGoal)} color="bg-lav-300" />
                  <div className="mb-1 mt-4 flex items-center justify-between text-xs"><span>학습 진도</span><b>{s.progress}%</b></div>
                  <input type="range" min="0" max="100" step="5" value={s.progress} onChange={(e) => update('subjects', s.id, { progress: Number(e.target.value) })} className="w-full accent-lav-400" aria-label={`${s.name} 진도`} />
                  <button className="btn-primary mt-3 w-full" onClick={() => { setLf({ minutes: 30, date: t }); setLogModal(s) }}>⏱ 공부 시간 기록</button>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <Modal open={!!subModal} onClose={() => setSubModal(null)} title={subModal?.s ? '분야 수정' : '새 분야'}>
        <form onSubmit={saveSub}>
          <Field label="분야 이름"><input autoFocus className="input" value={sf.name} onChange={(e) => setSf({ ...sf, name: e.target.value })} placeholder="예: 영어 회화" /></Field>
          <Field label="주간 목표 시간(분)"><input type="number" min="0" step="10" className="input" value={sf.weeklyGoal} onChange={(e) => setSf({ ...sf, weeklyGoal: e.target.value })} /></Field>
          <button className="btn-primary mt-2 w-full">저장하기</button>
        </form>
      </Modal>
      <Modal open={!!logModal} onClose={() => setLogModal(null)} title={`${logModal?.name} 공부 기록`}>
        <form onSubmit={saveLog}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="공부 시간(분)"><input autoFocus type="number" min="1" className="input" value={lf.minutes} onChange={(e) => setLf({ ...lf, minutes: e.target.value })} /></Field>
            <Field label="날짜"><input type="date" className="input" value={lf.date} onChange={(e) => setLf({ ...lf, date: e.target.value })} /></Field>
          </div>
          <button className="btn-primary mt-2 w-full">기록하기</button>
        </form>
      </Modal>
    </div>
  )
}
