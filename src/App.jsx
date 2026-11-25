import React, { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Todos from './pages/Todos'
import Habits from './pages/Habits'
import Workout from './pages/Workout'
import Study from './pages/Study'
import Journal from './pages/Journal'
import Report from './pages/Report'
import Settings from './pages/Settings'

export const NAV = [
  { id: 'dashboard', label: '대시보드', icon: '🏠', C: Dashboard },
  { id: 'schedule', label: '일정 관리', icon: '📅', C: Schedule },
  { id: 'todos', label: '할 일 관리', icon: '✅', C: Todos },
  { id: 'habits', label: '습관 관리', icon: '🌱', C: Habits },
  { id: 'workout', label: '운동 관리', icon: '🏃', C: Workout },
  { id: 'study', label: '자기계발', icon: '📚', C: Study },
  { id: 'journal', label: '일상 기록', icon: '📔', C: Journal },
  { id: 'report', label: '주간 리포트', icon: '📊', C: Report },
  { id: 'settings', label: '설정', icon: '⚙️', C: Settings },
]

const getRoute = () => (window.location.hash.replace('#/', '') || 'dashboard')

export default function App() {
  const [route, setRoute] = useState(getRoute)
  useEffect(() => {
    const h = () => { setRoute(getRoute()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])
  const current = NAV.find((n) => n.id === route) || NAV[0]
  const Page = current.C

  return (
    <div className="min-h-screen md:flex">
      {/* 데스크톱 사이드바 */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 p-4 md:flex">
        <div className="mb-4 flex items-center gap-2 px-3 py-2">
          <span className="text-2xl">🌿</span>
          <div>
            <div className="font-bold leading-tight">My Life Manager</div>
            <div className="text-[11px] text-ink-mute">나를 돌보는 하루</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <a key={n.id} href={`#/${n.id}`}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${current.id === n.id ? 'bg-white text-lav-500 shadow-soft' : 'text-ink-soft hover:bg-white/60'}`}>
              <span className="text-lg">{n.icon}</span>{n.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8">
        <Page />
      </main>

      {/* 모바일 하단 메뉴 (가로 스크롤) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-lav-100 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map((n) => (
          <a key={n.id} href={`#/${n.id}`}
            className={`flex min-w-[68px] flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium ${current.id === n.id ? 'text-lav-500' : 'text-ink-mute'}`}>
            <span className={`text-xl ${current.id === n.id ? '' : 'opacity-70'}`}>{n.icon}</span>
            <span className="whitespace-nowrap">{n.label}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}
