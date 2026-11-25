import React, { useEffect, useState } from 'react'
import { Card, PageHeader, DateNav, Field, Empty } from '../components/ui'
import { useStore } from '../lib/store'
import { today, label, addDays } from '../lib/dates'
import { MOODS } from '../lib/sample'

const BLANK = { mood: 0, good: '', bad: '', learned: '', tomorrow: '' }

export default function Journal() {
  const { data, setJournal } = useStore()
  const t = today()
  const [date, setDate] = useState(t)
  const [f, setF] = useState(BLANK)
  const [saved, setSaved] = useState(false)
  useEffect(() => { setF(data.journal[date] || BLANK); setSaved(false) }, [date]) // eslint-disable-line

  const save = (e) => { e.preventDefault(); setJournal(date, f); setSaved(true) }
  const entries = Object.entries(data.journal).filter(([, v]) => v.mood || v.good || v.bad || v.learned || v.tomorrow).sort((a, b) => (a[0] < b[0] ? 1 : -1))
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setSaved(false) }
  const area = 'input min-h-[72px] resize-y'

  return (
    <div>
      <PageHeader title="일상 기록" desc="하루를 돌아보고 나를 이해해요.">
        <DateNav date={date} onChange={setDate} today={t} />
      </PageHeader>
      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3" title={`${label(date)}의 기록`}>
          <form onSubmit={save}>
            <div className="mb-4">
              <span className="label">오늘의 기분</span>
              <div className="flex gap-2">
                {MOODS.map((m) => (
                  <button type="button" key={m.v} onClick={() => { setF({ ...f, mood: m.v }); setSaved(false) }} aria-label={m.t} aria-pressed={f.mood === m.v} title={m.t}
                    className={`flex-1 rounded-2xl py-2 text-2xl transition ${f.mood === m.v ? 'scale-105 bg-lav-100 ring-2 ring-lav-300' : 'bg-cream-50 opacity-70 hover:opacity-100'}`}>{m.e}</button>
                ))}
              </div>
              {f.mood > 0 && <p className="mt-1 text-center text-xs text-ink-mute">{MOODS.find((m) => m.v === f.mood).t}</p>}
            </div>
            <Field label="😊 오늘 좋았던 일"><textarea className={area} value={f.good} onChange={set('good')} placeholder="작은 기쁨도 좋아요" /></Field>
            <Field label="🌧 아쉬웠던 일"><textarea className={area} value={f.bad} onChange={set('bad')} /></Field>
            <Field label="💡 새롭게 배운 점"><textarea className={area} value={f.learned} onChange={set('learned')} /></Field>
            <Field label="🎯 내일의 목표"><textarea className={area} value={f.tomorrow} onChange={set('tomorrow')} /></Field>
            <div className="flex items-center gap-3">
              <button className="btn-primary">저장하기</button>
              {saved && <span className="text-xs text-sky2-500">✓ 저장되었어요</span>}
            </div>
          </form>
        </Card>

        <Card className="lg:col-span-2" title="지난 기록">
          {entries.length === 0 ? <Empty icon="📔" title="아직 쓴 기록이 없어요" desc="오늘의 기분부터 골라 볼까요?" /> : (
            <ul className="max-h-[560px] space-y-2 overflow-auto">
              {entries.map(([d, v]) => (
                <li key={d}>
                  <button onClick={() => setDate(d)} className={`w-full rounded-2xl p-3 text-left ${d === date ? 'bg-lav-100' : 'bg-cream-50 hover:bg-lav-50'}`}>
                    <div className="flex items-center gap-2 text-xs text-ink-mute"><span className="text-xl">{MOODS.find((m) => m.v === v.mood)?.e || '📝'}</span>{label(d)}</div>
                    <div className="mt-1 truncate text-sm">{v.good || v.learned || v.bad || v.tomorrow}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
