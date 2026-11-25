import React, { useState } from 'react'
import { Card, PageHeader, DateNav, Empty, Ring } from '../components/ui'
import { TodoItem, TodoModal } from '../components/TodoParts'
import { useStore } from '../lib/store'
import { today, addDays, label } from '../lib/dates'
import { CATEGORIES } from '../lib/sample'
import { todosOn, todoRate } from '../lib/stats'

const RANK = { high: 0, mid: 1, low: 2 }

export default function Todos() {
  const { data, add, update, remove } = useStore()
  const t = today()
  const [date, setDate] = useState(t)
  const [cat, setCat] = useState('전체')
  const [modal, setModal] = useState(null)
  const [quick, setQuick] = useState('')

  const all = todosOn(data, date)
  const list = all.filter((x) => cat === '전체' || x.category === cat).sort((a, b) => RANK[a.priority] - RANK[b.priority])
  const doing = list.filter((x) => !x.done)
  const done = list.filter((x) => x.done)
  const r = todoRate(data, date)
  const missed = data.todos.filter((x) => x.date < t && !x.done) // 지난 날 미완료

  const save = (f) => (modal.initial ? update('todos', modal.initial.id, f) : add('todos', { ...f, done: false }))
  const quickAdd = (e) => { e.preventDefault(); if (!quick.trim()) return; add('todos', { title: quick.trim(), priority: 'mid', category: cat === '전체' ? '기타' : cat, date, done: false }); setQuick('') }
  const postpone = (x) => update('todos', x.id, { date: addDays(x.date, 1) })
  const moveAllMissed = () => missed.forEach((x) => update('todos', x.id, { date: t }))
  const moveTomorrow = () => doing.forEach(postpone)

  const Row = (x) => <TodoItem key={x.id} t={x} update={update} remove={remove} onEdit={(i) => setModal({ initial: i })} onPostpone={postpone} />

  return (
    <div>
      <PageHeader title="할 일 관리" desc={`${label(date)}의 할 일`}>
        <DateNav date={date} onChange={setDate} today={t} />
        <button className="btn-primary" onClick={() => setModal({})}>＋ 새 할 일</button>
      </PageHeader>

      {missed.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-lav-100 px-4 py-3 text-sm">
          <span>🍂 지난 날 못 끝낸 일이 <b>{missed.length}개</b> 있어요.</span>
          <button className="btn-primary !py-1" onClick={moveAllMissed}>오늘로 가져오기</button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <form onSubmit={quickAdd} className="flex gap-2">
            <input className="input" value={quick} onChange={(e) => setQuick(e.target.value)} placeholder="빠르게 할 일 추가 후 Enter ↵" aria-label="빠른 할 일 추가" />
            <button className="btn-primary shrink-0">추가</button>
          </form>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {['전체', ...CATEGORIES].map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${cat === c ? 'bg-lav-400 text-white' : 'bg-white text-ink-soft'}`}>{c}</button>
            ))}
          </div>

          <Card title={`진행 중 (${doing.length})`} action={doing.length > 0 && <button className="btn-ghost !py-1 text-xs" onClick={moveTomorrow}>모두 내일로</button>}>
            {doing.length ? <ul className="space-y-2">{doing.map(Row)}</ul>
              : <Empty icon={all.length ? '🎉' : '🍃'} title={all.length ? '진행 중인 일을 모두 끝냈어요!' : '이 날은 할 일이 없어요'} desc={all.length ? '' : '위 입력창이나 “새 할 일” 버튼으로 추가해 보세요.'} />}
          </Card>

          <Card title={`완료 (${done.length})`}>
            {done.length ? <ul className="space-y-2">{done.map(Row)}</ul> : <p className="py-3 text-center text-xs text-ink-mute">아직 완료한 일이 없어요. 체크박스를 눌러 완료해 보세요.</p>}
          </Card>
        </div>

        <Card title="달성률" className="h-fit">
          <div className="flex flex-col items-center gap-2">
            <Ring value={r.rate} size={140} sub={`${r.done}/${r.total} 완료`} />
            <p className="text-center text-xs text-ink-soft">{r.total === 0 ? '할 일을 추가하면 달성률이 표시돼요.' : r.rate === 100 ? '모두 완료! 멋져요 🎉' : `${r.total - r.done}개만 더 하면 돼요.`}</p>
          </div>
        </Card>
      </div>
      <TodoModal open={!!modal} onClose={() => setModal(null)} initial={modal?.initial} date={date} onSave={save} />
    </div>
  )
}
