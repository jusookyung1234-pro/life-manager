import React, { useState } from 'react'
import { Card, PageHeader, Modal, Field, PrioritySelect, PriorityBadge, Empty } from '../components/ui'
import { useStore } from '../lib/store'
import { today, label, parse, fmt, addDays, DOW, toMin } from '../lib/dates'
import { eventsOn, overlapIds } from '../lib/stats'

function EventModal({ open, onClose, initial, date, onSave }) {
  const blank = { title: '', date, start: '09:00', end: '10:00', priority: 'mid' }
  const [f, setF] = useState(blank)
  React.useEffect(() => { if (open) setF(initial || { ...blank, date }) }, [open]) // eslint-disable-line
  const invalid = toMin(f.end) <= toMin(f.start)
  const submit = (e) => {
    e.preventDefault()
    if (!f.title.trim() || invalid) return
    onSave({ ...f, title: f.title.trim() }); onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title={initial ? '일정 수정' : '새 일정'}>
      <form onSubmit={submit}>
        <Field label="일정 이름"><input autoFocus className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="예: 팀 미팅" /></Field>
        <Field label="날짜"><input type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="시작 시간"><input type="time" className="input" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></Field>
          <Field label="종료 시간"><input type="time" className="input" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} /></Field>
        </div>
        {invalid && <p className="mb-2 text-xs text-rose-500">종료 시간은 시작 시간보다 늦어야 해요.</p>}
        <Field label="중요도"><PrioritySelect value={f.priority} onChange={(priority) => setF({ ...f, priority })} /></Field>
        <button className="btn-primary mt-2 w-full" disabled={invalid}>{initial ? '저장하기' : '추가하기'}</button>
      </form>
    </Modal>
  )
}

export default function Schedule() {
  const { data, add, update, remove } = useStore()
  const t = today()
  const [sel, setSel] = useState(t)
  const [month, setMonth] = useState(() => { const d = parse(t); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [modal, setModal] = useState(null) // {initial?}

  const first = month.getDay()
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => fmt(new Date(month.getFullYear(), month.getMonth(), i + 1)))]
  const shiftMonth = (n) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1))

  const events = eventsOn(data, sel)
  const overlaps = overlapIds(events)
  const save = (f) => (modal.initial ? update('events', modal.initial.id, f) : add('events', f))

  return (
    <div>
      <PageHeader title="일정 관리" desc="날짜를 눌러 하루 일정을 확인하고 추가해요.">
        <button className="btn-primary" onClick={() => setModal({})}>＋ 일정 추가</button>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3" title={`${month.getFullYear()}년 ${month.getMonth() + 1}월`}
          action={<div className="flex gap-1"><button className="btn-ghost !px-3" onClick={() => shiftMonth(-1)} aria-label="이전 달">‹</button><button className="btn-ghost" onClick={() => { setMonth(new Date(parse(t).getFullYear(), parse(t).getMonth(), 1)); setSel(t) }}>오늘</button><button className="btn-ghost !px-3" onClick={() => shiftMonth(1)} aria-label="다음 달">›</button></div>}>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink-mute">{DOW.map((d, i) => <div key={d} className={i === 0 ? 'text-rose-400' : ''}>{d}</div>)}</div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />
              const evs = eventsOn(data, d)
              const conflict = overlapIds(evs).size > 0
              return (
                <button key={d} onClick={() => setSel(d)} aria-label={label(d)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-2xl text-sm transition ${d === sel ? 'bg-lav-400 text-white shadow-soft' : d === t ? 'bg-sky2-100 font-bold' : 'hover:bg-lav-50'}`}>
                  {Number(d.slice(8))}
                  <span className="mt-0.5 flex h-1.5 gap-0.5">
                    {evs.slice(0, 3).map((e) => <i key={e.id} className={`h-1.5 w-1.5 rounded-full ${conflict ? 'bg-rose-400' : d === sel ? 'bg-white' : 'bg-lav-300'}`} />)}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-[11px] text-ink-mute">● 점은 일정 수 · 빨간 점은 시간이 겹치는 날이에요.</p>
        </Card>

        <Card className="lg:col-span-2" title={label(sel)} action={<span className="text-xs text-ink-mute">{events.length}건</span>}>
          {events.length === 0 ? (
            <Empty icon="☁️" title="이 날은 일정이 없어요" action={<button className="btn-primary" onClick={() => setModal({})}>일정 추가</button>} />
          ) : (
            <ul className="space-y-2">
              {events.map((e) => (
                <li key={e.id} className={`rounded-2xl p-3 ${overlaps.has(e.id) ? 'bg-rose-50 ring-1 ring-rose-200' : 'bg-cream-50'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-lav-500">{e.start} – {e.end}</span>
                    <PriorityBadge p={e.priority} />
                  </div>
                  <div className="mt-1 text-sm font-medium">{e.title}</div>
                  {overlaps.has(e.id) && <div className="mt-1 text-[11px] text-rose-500">⚠ 다른 일정과 시간이 겹쳐요</div>}
                  <div className="mt-2 flex gap-1">
                    <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => setModal({ initial: e })}>수정</button>
                    <button className="btn-danger !px-2 !py-1 text-xs" onClick={() => remove('events', e.id)}>삭제</button>
                    <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => update('events', e.id, { date: addDays(e.date, 1) })}>내일로</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <EventModal open={!!modal} onClose={() => setModal(null)} initial={modal?.initial} date={sel} onSave={save} />
    </div>
  )
}
