import React, { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, PageHeader, Stat, Empty } from '../components/ui'
import { AICoach } from '../components/AIPanels'
import { useStore } from '../lib/store'
import { today, addDays, weekStart, label } from '../lib/dates'
import { weekStats } from '../lib/stats'

export default function Report() {
  const { data } = useStore()
  const t = today()
  const [anchor, setAnchor] = useState(t)
  const ws = weekStats(data, anchor)
  const start = weekStart(anchor)
  const upTo = ws.filter((d) => d.date <= t)
  const sum = (k) => ws.reduce((a, d) => a + d[k], 0)
  const habitAvg = upTo.length && data.habits.length ? Math.round(upTo.reduce((a, d) => a + d.habitRate, 0) / upTo.length) : 0
  const hasData = sum('todoTotal') + sum('workouts') + sum('study') > 0 || habitAvg > 0
  const best = [...upTo].sort((a, b) => b.score - a.score)[0]
  const weak = []
  if (data.habits.length && habitAvg < 60) weak.push('습관 달성률이 60% 미만이에요. 쉬운 습관 하나부터 확실히 챙겨요.')
  if (sum('workouts') < (data.profile.workoutGoal || 3)) weak.push(`운동 횟수가 목표(${data.profile.workoutGoal}회)보다 적어요. 짧은 산책도 좋아요.`)
  if (sum('todoTotal') && sum('todoDone') / sum('todoTotal') < 0.6) weak.push('할 일 완료율이 낮아요. 하루 할 일을 3~5개로 줄여 보세요.')
  if (data.subjects.length && sum('study') < data.subjects.reduce((a, s) => a + Number(s.weeklyGoal), 0) * 0.5) weak.push('공부 시간이 주간 목표의 절반에 못 미쳐요.')
  const low = [...upTo].sort((a, b) => a.score - b.score)[0]
  if (low && best && low.date !== best.date) weak.push(`${low.name}요일은 활동이 가장 적었어요. 그날 일정을 가볍게 조정해 보세요.`)

  const chartData = ws.map((d) => ({ ...d, 완료: d.todoDone, 미완료: d.todoTotal - d.todoDone, 습관: d.habitRate, 공부: d.study, 운동: d.workoutMin }))
  const isCur = start === weekStart(t)

  return (
    <div>
      <PageHeader title="주간 리포트" desc={`${label(start)} ~ ${label(addDays(start, 6))}`}>
        <div className="flex gap-1 rounded-2xl bg-white/80 p-1 shadow-soft">
          <button className="btn-ghost !px-3" onClick={() => setAnchor(addDays(anchor, -7))} aria-label="지난 주">‹</button>
          <button className="btn-ghost" onClick={() => setAnchor(t)} disabled={isCur}>이번 주</button>
          <button className="btn-ghost !px-3" onClick={() => setAnchor(addDays(anchor, 7))} aria-label="다음 주">›</button>
        </div>
      </PageHeader>

      {!hasData ? <Empty icon="📊" title="이 주는 기록이 없어요" desc="할 일·습관·운동·공부를 기록하면 리포트가 만들어져요." /> : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat icon="✅" label="완료한 할 일" value={`${sum('todoDone')}/${sum('todoTotal')}개`} />
            <Stat icon="🌱" label="평균 습관 달성률" value={`${habitAvg}%`} tint="bg-sky2-50" />
            <Stat icon="🏃" label="운동 횟수" value={`${sum('workouts')}회`} tint="bg-cream-200" />
            <Stat icon="📚" label="공부 시간" value={`${Math.floor(sum('study') / 60)}시간 ${sum('study') % 60}분`} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="🏆 가장 생산적이었던 요일">
              {best && best.score > 0 ? <div><div className="text-3xl font-bold text-lav-500">{best.name}요일</div>
                <p className="mt-1 text-sm text-ink-soft">할 일 {best.todoDone}개 · 습관 {best.habitRate}% · 운동 {best.workouts}회 · 공부 {best.study}분</p></div>
                : <p className="text-sm text-ink-mute">아직 비교할 기록이 부족해요.</p>}
            </Card>
            <Card title="🌤 개선하면 좋을 부분">
              {weak.length ? <ul className="space-y-1.5 text-sm">{weak.map((w, i) => <li key={i} className="rounded-xl bg-lav-50 px-3 py-2">{w}</li>)}</ul>
                : <p className="text-sm text-ink-soft">이번 주는 균형이 아주 좋아요! 👏</p>}
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="요일별 할 일">
              <div className="h-56"><ResponsiveContainer><BarChart data={chartData} margin={{ left: -20 }}><CartesianGrid vertical={false} stroke="#f0eaf9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f6f3fc' }} /><Bar dataKey="완료" stackId="a" fill="#a28fd6" /><Bar dataKey="미완료" stackId="a" fill="#e0d8f3" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
            </Card>
            <Card title="요일별 습관 달성률">
              <div className="h-56"><ResponsiveContainer><LineChart data={chartData} margin={{ left: -20 }}><CartesianGrid vertical={false} stroke="#f0eaf9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${v}%`} /><Line dataKey="습관" stroke="#74aadb" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></div>
            </Card>
            <Card title="요일별 공부 · 운동 시간(분)" className="lg:col-span-2">
              <div className="h-56"><ResponsiveContainer><BarChart data={chartData} margin={{ left: -20 }}><CartesianGrid vertical={false} stroke="#f0eaf9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f6f3fc' }} /><Bar dataKey="공부" fill="#c0b0e6" radius={[8, 8, 0, 0]} /><Bar dataKey="운동" fill="#9cc5ea" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
            </Card>
          </div>
          {isCur && <AICoach />}
        </div>
      )}
    </div>
  )
}
