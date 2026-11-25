# My Life Manager

설치/실행은 Google Drive 폴더 밖(예: C:\dev)에서 하세요. Drive 동기화 폴더에서는 npm install이 실패합니다.

```
npm install
npm run dev   # http://localhost:5173
```

AI 연동: src/lib/ai.js 의 getDayPlan / getCoaching 을 API 호출로 교체.
데이터 저장: src/lib/store.jsx (LocalStorage) 를 DB API로 교체.
