import React, { useState } from 'react'
import { Modal, Field, PrioritySelect, PriorityBadge } from './ui'
import { CATEGORIES } from '../lib/sample'

export function toggleTodo(update, t) {
  update('todos', t.id, { done: !t.done, doneHour: !t.done ? new Date().getHours() : null })
}

export function TodoItem({ t, update, remove, onEdit, onPostpone }) {
  return (
    <li className="group flex items-center gap-3 rounded-2xl bg-cream-50 px-3 py-2.5">
      <input type="checkbox" checked={t.done} onChange={() => toggleTodo(update, t)} aria-label={`${t.title} 완료`}
        className="h-5 w-5 shrink-0 cursor-pointer accent-lav-400" />
      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm ${t.done ? 'text-ink-mute line-through' : ''}`}>{t.title}</div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <PriorityBadge p={t.priority} />
          <span className="text-[11px] text-ink-mute">{t.category}</span>
        </div>
      </div>
      <div className="flex shrink-0 gap-1 text-xs">
        {onPostpone && !t.done && <button className="btn-ghost !px-2 !py-1" onClick={() => onPostpone(t)} title="내일로 미루기">내일로</button>}
        {onEdit && <button className="btn-ghost !px-2 !py-1" onClick={() => onEdit(t)} aria-label="수정">✏️</button>}
        {remove && <button className="btn-danger !px-2 !py-1" onClick={() => remove('todos', t.id)} aria-label="삭제">🗑</button>}
      </div>
    </li>
  )
}

export function TodoModal({ open, onClose, initial, date, onSave }) {
  const blank = { title: '', priority: 'mid', category: '업무', date }
  const [f, setF] = useState(initial || blank)
  React.useEffect(() => { if (open) setF(initial || { ...blank, date }) }, [open]) // eslint-disable-line
  const submit = (e) => {
    e.preventDefault()
    if (!f.title.trim()) return
    onSave({ ...f, title: f.title.trim() })
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title={initial ? '할 일 수정' : '새 할 일'}>
      <form onSubmit={submit}>
        <Field label="할 일"><input autoFocus className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="예: 보고서 초안 작성" /></Field>
        <Field label="중요도"><PrioritySelect value={f.priority} onChange={(priority) => setF({ ...f, priority })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="카테고리">
            <select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="날짜"><input type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        </div>
        <button className="btn-primary mt-2 w-full">{initial ? '저장하기' : '추가하기'}</button>
      </form>
    </Modal>
  )
}
