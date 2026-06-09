import { useState } from 'react'
import { createPlan, getPlans, getPlan } from '../api/client'

interface Week {
  week: number
  theme: string
  daily_goals: string[]
  resources: string[]
  review: string
}

interface Plan {
  id: number
  title: string
  content: {
    overview: string
    weeks: Week[]
  }
}

export default function PlanView() {
  const [tab, setTab] = useState<'create' | 'list'>('create')
  const [goal, setGoal] = useState('')
  const [weeks, setWeeks] = useState(4)
  const [level, setLevel] = useState('beginner')
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
  const [plans, setPlans] = useState<any[]>([])

  async function handleCreate() {
    if (!goal.trim()) return
    setLoading(true)
    try {
      const plan = await createPlan(goal, weeks, level)
      setCurrentPlan(plan)
    } catch {
      alert('플랜 생성 실패. 서버가 실행 중인지 확인하세요.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLoadPlans() {
    const data = await getPlans()
    setPlans(data)
    setTab('list')
  }

  async function handleSelectPlan(id: number) {
    const plan = await getPlan(id)
    setCurrentPlan(plan)
    setTab('create')
  }

  return (
    <div className="plan-view">
      <div className="plan-tabs">
        <button className={tab === 'create' ? 'active' : ''} onClick={() => setTab('create')}>
          플랜 생성
        </button>
        <button className={tab === 'list' ? 'active' : ''} onClick={handleLoadPlans}>
          저장된 플랜
        </button>
      </div>

      {tab === 'create' && (
        <div className="plan-create">
          {!currentPlan ? (
            <div className="plan-form">
              <h2>학습 플랜 만들기</h2>
              <label>학습 목표</label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="예: React와 TypeScript로 풀스택 웹 개발 마스터하기"
                rows={3}
              />
              <label>기간 (주)</label>
              <input
                type="number"
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                min={1}
                max={52}
              />
              <label>현재 수준</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="beginner">입문자</option>
                <option value="intermediate">중급자</option>
                <option value="advanced">고급자</option>
              </select>
              <button className="create-btn" onClick={handleCreate} disabled={loading || !goal.trim()}>
                {loading ? '생성 중...' : '플랜 생성'}
              </button>
            </div>
          ) : (
            <div className="plan-result">
              <div className="plan-header">
                <h2>{currentPlan.title}</h2>
                <button onClick={() => setCurrentPlan(null)}>새 플랜</button>
              </div>
              <p className="overview">{currentPlan.content.overview}</p>
              <div className="weeks">
                {currentPlan.content.weeks?.map((w: Week) => (
                  <div key={w.week} className="week-card">
                    <h3>Week {w.week}: {w.theme}</h3>
                    <div className="daily-goals">
                      {['월', '화', '수', '목', '금'].map((day, i) => (
                        <div key={i} className="day-goal">
                          <span className="day">{day}</span>
                          <span>{w.daily_goals[i]}</span>
                        </div>
                      ))}
                    </div>
                    {w.resources.length > 0 && (
                      <div className="resources">
                        <strong>참고 자료</strong>
                        <ul>
                          {w.resources.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    )}
                    <div className="review">
                      <strong>주말 복습</strong> {w.review}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'list' && (
        <div className="plan-list">
          <h2>저장된 플랜</h2>
          {plans.length === 0 ? (
            <p>저장된 플랜이 없습니다.</p>
          ) : (
            plans.map((p) => (
              <div key={p.id} className="plan-item" onClick={() => handleSelectPlan(p.id)}>
                <h3>{p.title}</h3>
                <p>{p.goal}</p>
                <span>{p.duration_weeks}주 플랜</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
