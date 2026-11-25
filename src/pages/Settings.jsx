import React, { useRef, useState } from 'react'
import { Card, PageHeader, Field } from '../components/ui'
import { useStore } from '../lib/store'

export default function Settings() {
  const { data, patch, reset, replaceAll } = useStore()
  const [name, setName] = useState(data.profile.name)
  const [msg, setMsg] = useState('')
  const file = useRef(null)
  const note = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a'); a.href = url; a.download = 'my-life-manager-backup.json'; a.click(); URL.revokeObjectURL(url)
  }
  const importJson = (e) => {
    const f = e.target.files[0]; if (!f) return
    const r = new FileReader()
    r.onload = () => { try { const o = JSON.parse(r.result); if (!o || typeof o !== 'object') throw 0; replaceAll(o); note('백업을 불러왔어요 ✓') } catch { note('올바른 백업 파일이 아니에요.') } }
    r.readAsText(f); e.target.value = ''
  }

  return (
    <div>
      <PageHeader title="설정" desc="프로필과 데이터를 관리해요." />
      {msg && <div className="mb-4 rounded-2xl bg-sky2-100 px-4 py-2 text-sm" role="status">{msg}</div>}
      <div className="grid gap-5 md:grid-cols-2">
        <Card title="프로필">
          <Field label="이름(인사말에 사용돼요)"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 유진" /></Field>
          <button className="btn-primary" onClick={() => { patch((d) => ({ profile: { ...d.profile, name: name.trim() } })); note('저장했어요 ✓') }}>저장</button>
        </Card>
        <Card title="AI 매니저">
          <p className="text-sm text-ink-soft">지금은 내 기록을 규칙으로 분석하는 <b>시뮬레이션 모드</b>예요. <code className="rounded bg-lav-50 px-1">src/lib/ai.js</code>의 함수만 실제 AI API 호출로 바꾸면 화면은 그대로 동작해요.</p>
        </Card>
        <Card title="데이터 백업">
          <p className="mb-3 text-sm text-ink-soft">데이터는 이 브라우저(LocalStorage)에만 저장돼요. 기기를 옮길 땐 백업 파일을 사용하세요.</p>
          <div className="flex flex-wrap gap-2"><button className="btn-ghost" onClick={exportJson}>⬇ 내보내기</button><button className="btn-ghost" onClick={() => file.current.click()}>⬆ 불러오기</button></div>
          <input ref={file} type="file" accept="application/json" className="hidden" onChange={importJson} />
        </Card>
        <Card title="데이터 초기화">
          <p className="mb-3 text-sm text-ink-soft">샘플 데이터로 둘러보거나, 모두 비우고 처음부터 시작할 수 있어요.</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => { if (confirm('현재 데이터를 지우고 샘플 데이터를 불러올까요?')) { reset('sample'); note('샘플 데이터를 불러왔어요') } }}>샘플 데이터 불러오기</button>
            <button className="btn-danger" onClick={() => { if (confirm('모든 데이터를 삭제할까요? 되돌릴 수 없어요.')) { reset('empty'); note('모든 데이터를 비웠어요') } }}>모두 비우기</button>
          </div>
        </Card>
      </div>
    </div>
  )
}
