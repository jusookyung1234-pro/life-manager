import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { emptyData, sampleData } from './sample'
import { uid } from './dates'

// 모든 데이터는 하나의 키로 LocalStorage에 저장됩니다. (날짜별 데이터는 각 항목의 date 필드 / 날짜 키로 구분)
// 추후 DB로 옮길 때는 이 파일의 load/save 와 CRUD 함수만 API 호출로 교체하면 됩니다.
const KEY = 'my-life-manager:v1'
const Ctx = createContext(null)

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...emptyData(), ...JSON.parse(raw) }
  } catch (e) { /* ignore */ }
  return sampleData() // 첫 방문: 샘플 데이터로 시작
}

export function StoreProvider({ children }) {
  const [data, setData] = useState(load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(data)) } catch (e) { /* ignore */ }
  }, [data])

  const add = useCallback((key, item) => setData((d) => ({ ...d, [key]: [...d[key], { id: uid(), ...item }] })), [])
  const update = useCallback(
    (key, id, patch) => setData((d) => ({ ...d, [key]: d[key].map((x) => (x.id === id ? { ...x, ...(typeof patch === 'function' ? patch(x) : patch) } : x)) })),
    [],
  )
  const remove = useCallback((key, id) => setData((d) => ({ ...d, [key]: d[key].filter((x) => x.id !== id) })), [])
  const patch = useCallback((p) => setData((d) => ({ ...d, ...(typeof p === 'function' ? p(d) : p) })), [])
  const toggleHabit = useCallback(
    (date, hid) =>
      setData((d) => {
        const cur = d.habitLogs[date] || []
        const next = cur.includes(hid) ? cur.filter((x) => x !== hid) : [...cur, hid]
        return { ...d, habitLogs: { ...d.habitLogs, [date]: next } }
      }),
    [],
  )
  const setJournal = useCallback((date, v) => setData((d) => ({ ...d, journal: { ...d.journal, [date]: v } })), [])
  const setDailyGoal = useCallback((date, v) => setData((d) => ({ ...d, dailyGoal: { ...d.dailyGoal, [date]: v } })), [])
  const reset = useCallback((mode) => setData(mode === 'sample' ? sampleData() : emptyData()), [])
  const replaceAll = useCallback((obj) => setData({ ...emptyData(), ...obj }), [])

  return (
    <Ctx.Provider value={{ data, add, update, remove, patch, toggleHabit, setJournal, setDailyGoal, reset, replaceAll }}>{children}</Ctx.Provider>
  )
}
export const useStore = () => useContext(Ctx)
