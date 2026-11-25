import { today, addDays, uid } from './dates'

export const PRIORITIES = { high: '매우 중요', mid: '중요', low: '여유 있을 때' }
export const PRIORITY_STYLE = {
  high: 'bg-rose-50 text-rose-500',
  mid: 'bg-lav-100 text-lav-500',
  low: 'bg-sky2-100 text-sky2-500',
}
export const CATEGORIES = ['업무', '공부', '건강', '생활', '약속', '기타']
export const MOODS = [
  { v: 5, e: '😄', t: '최고예요' },
  { v: 4, e: '🙂', t: '좋아요' },
  { v: 3, e: '😐', t: '보통이에요' },
  { v: 2, e: '😔', t: '조금 우울해요' },
  { v: 1, e: '😢', t: '힘들어요' },
]
export const WORKOUT_TYPES = ['걷기', '러닝', '요가', '근력 운동', '스트레칭', '자전거', '수영']

export const emptyData = () => ({
  profile: { name: '', workoutGoal: 3 },
  events: [],
  todos: [],
  habits: [],
  habitLogs: {},
  workouts: [],
  subjects: [],
  studyLogs: [],
  journal: {},
  dailyGoal: {},
})

export function sampleData() {
  const t = today()
  const d = emptyData()
  d.profile = { name: '유진', workoutGoal: 3 }
  d.dailyGoal[t] = '중요한 일 하나를 끝내고 저녁엔 푹 쉬기'

  const ev = (date, title, start, end, priority) => d.events.push({ id: uid(), date, title, start, end, priority })
  ev(t, '팀 미팅', '10:00', '11:00', 'high')
  ev(t, '점심 약속', '12:00', '13:00', 'low')
  ev(t, '프로젝트 자료 정리', '14:00', '16:00', 'high')
  ev(t, '기획 회의', '15:30', '16:30', 'mid')
  ev(addDays(t, 1), '병원 예약', '09:30', '10:30', 'mid')
  ev(addDays(t, 2), '독서 모임', '19:00', '21:00', 'low')

  const td = (date, title, priority, category, done = false) => d.todos.push({ id: uid(), date, title, priority, category, done })
  td(t, '발표 자료 마무리', 'high', '업무')
  td(t, '보고서 초안 제출', 'high', '업무')
  td(t, '영어 단어 30개 외우기', 'mid', '공부', true)
  td(t, '장보기', 'mid', '생활')
  td(t, '친구에게 안부 연락', 'low', '약속')
  td(t, '방 정리하기', 'low', '생활')
  td(addDays(t, -1), '이메일 답장하기', 'mid', '업무', true)
  td(addDays(t, -1), '세탁물 찾기', 'low', '생활')
  td(addDays(t, -2), '자료 조사', 'high', '업무', true)
  td(addDays(t, -2), '운동복 빨래', 'low', '생활', true)
  td(addDays(t, -3), '기획안 수정', 'high', '업무', true)
  td(addDays(t, -4), '은행 업무', 'mid', '생활', true)
  td(addDays(t, -4), '독서 감상 정리', 'low', '공부')
  td(addDays(t, 1), '치과 서류 준비', 'mid', '생활')

  d.habits = [
    { id: 'h1', name: '물 마시기', icon: '💧' },
    { id: 'h2', name: '독서하기', icon: '📖' },
    { id: 'h3', name: '스트레칭하기', icon: '🧘' },
    { id: 'h4', name: '운동하기', icon: '🏃' },
    { id: 'h5', name: '공부하기', icon: '✏️' },
    { id: 'h6', name: '정해진 시간에 취침하기', icon: '🌙' },
  ]
  const pat = {
    h1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    h2: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 12],
    h3: [1, 3, 5, 8, 11],
    h4: [2, 5, 9],
    h5: [0, 1, 2, 4, 5, 6, 8, 10],
    h6: [1, 2, 4, 7, 9, 12],
  }
  for (let i = 0; i < 40; i++) {
    const date = addDays(t, -i)
    const ids = d.habits
      .filter((h) => (pat[h.id] || []).includes(i) || (i > 12 && (i + h.id.charCodeAt(1)) % 3 === 0))
      .map((h) => h.id)
    if (ids.length) d.habitLogs[date] = ids
  }

  ;[[-6, '걷기', 30], [-4, '요가', 40], [-3, '근력 운동', 45], [-1, '러닝', 25], [0, '스트레칭', 15]].forEach(([n, type, minutes]) =>
    d.workouts.push({ id: uid(), date: addDays(t, n), type, minutes, done: n < 0 }),
  )

  d.subjects = [
    { id: 's1', name: '영어 회화', weeklyGoal: 180, progress: 45 },
    { id: 's2', name: '웹 개발', weeklyGoal: 300, progress: 30 },
    { id: 's3', name: '독서', weeklyGoal: 120, progress: 60 },
  ]
  ;[[-6, 's1', 30], [-6, 's2', 60], [-5, 's2', 90], [-4, 's3', 30], [-3, 's1', 40], [-3, 's2', 50], [-2, 's2', 70], [-1, 's3', 40], [-1, 's1', 30], [0, 's2', 45]].forEach(
    ([n, subjectId, minutes]) => d.studyLogs.push({ id: uid(), date: addDays(t, n), subjectId, minutes }),
  )

  d.journal[addDays(t, -1)] = { mood: 4, good: '산책하면서 머리가 맑아졌어요', bad: '점심을 급하게 먹었어요', learned: '작게 시작하면 부담이 줄어든다', tomorrow: '발표 자료 마무리' }
  d.journal[addDays(t, -2)] = { mood: 3, good: '책 한 챕터 완독', bad: '늦잠', learned: '', tomorrow: '일찍 일어나기' }
  return d
}
