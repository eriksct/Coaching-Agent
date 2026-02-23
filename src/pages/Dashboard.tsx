import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Goal } from '../lib/types'

const STATUS_LABELS: Record<Goal['status'], string> = {
  active: 'Active',
  on_track: 'On Track',
  behind: 'Behind',
  completed: 'Completed',
  abandoned: 'Abandoned',
}

const STATUS_COLORS: Record<Goal['status'], string> = {
  active: '#6366f1',
  on_track: '#22c55e',
  behind: '#f59e0b',
  completed: '#10b981',
  abandoned: '#94a3b8',
}

const DOMAIN_LABELS: Record<string, string> = {
  budgeting: 'Budgeting',
  debt: 'Debt',
  saving: 'Saving',
  investing: 'Investing',
  income: 'Income',
}

export default function Dashboard() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', description: '', domain: 'saving', deadline: '' })

  useEffect(() => {
    loadGoals()
  }, [])

  async function loadGoals() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setGoals(data as Goal[])
    setLoading(false)
  }

  async function handleAddGoal(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('goals').insert({
      user_id: user.id,
      title: newGoal.title,
      description: newGoal.description || null,
      domain: newGoal.domain,
      deadline: newGoal.deadline || null,
    })

    setNewGoal({ title: '', description: '', domain: 'saving', deadline: '' })
    setShowAddGoal(false)
    loadGoals()
  }

  async function updateGoalStatus(goalId: string, status: Goal['status']) {
    await supabase.from('goals').update({ status }).eq('id', goalId)
    loadGoals()
  }

  const activeGoals = goals.filter(g => ['active', 'on_track', 'behind'].includes(g.status))
  const completedGoals = goals.filter(g => g.status === 'completed')
  const abandonedGoals = goals.filter(g => g.status === 'abandoned')

  if (loading) {
    return <div className="dashboard-loading">Loading goals...</div>
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h2>Your Goals</h2>
          <p className="dashboard-subtitle">Track your financial progress</p>
        </div>
        <button onClick={() => setShowAddGoal(true)} className="add-goal-btn">
          + New Goal
        </button>
      </div>

      {showAddGoal && (
        <div className="modal-overlay" onClick={() => setShowAddGoal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Set a New Goal</h3>
            <form onSubmit={handleAddGoal}>
              <div className="form-group">
                <label>What's your goal?</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder='e.g., "Build $5,000 emergency fund"'
                  required
                />
              </div>
              <div className="form-group">
                <label>Details (optional)</label>
                <textarea
                  value={newGoal.description}
                  onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Any context that will help your coach..."
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newGoal.domain}
                    onChange={e => setNewGoal({ ...newGoal, domain: e.target.value })}
                  >
                    <option value="saving">Saving</option>
                    <option value="budgeting">Budgeting</option>
                    <option value="debt">Debt</option>
                    <option value="investing">Investing</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Target date (optional)</label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddGoal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeGoals.length === 0 && completedGoals.length === 0 && abandonedGoals.length === 0 ? (
        <div className="dashboard-empty">
          <div className="dashboard-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h3>No goals yet</h3>
          <p>Start a coaching session to set your first goal, or add one manually.</p>
        </div>
      ) : (
        <div className="goals-sections">
          {activeGoals.length > 0 && (
            <div className="goals-section">
              <h3 className="section-title">Active Goals ({activeGoals.length})</h3>
              <div className="goals-grid">
                {activeGoals.map(goal => (
                  <div key={goal.id} className="goal-card">
                    <div className="goal-card-header">
                      <span
                        className="goal-status-badge"
                        style={{ backgroundColor: STATUS_COLORS[goal.status] }}
                      >
                        {STATUS_LABELS[goal.status]}
                      </span>
                      {goal.domain && (
                        <span className="goal-domain">{DOMAIN_LABELS[goal.domain] || goal.domain}</span>
                      )}
                    </div>
                    <h4 className="goal-title">{goal.title}</h4>
                    {goal.description && <p className="goal-description">{goal.description}</p>}
                    {goal.deadline && (
                      <p className="goal-deadline">
                        Target: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    )}
                    <div className="goal-actions">
                      <select
                        value={goal.status}
                        onChange={e => updateGoalStatus(goal.id, e.target.value as Goal['status'])}
                        className="status-select"
                      >
                        <option value="active">Active</option>
                        <option value="on_track">On Track</option>
                        <option value="behind">Behind</option>
                        <option value="completed">Completed</option>
                        <option value="abandoned">Abandoned</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div className="goals-section">
              <h3 className="section-title">Completed ({completedGoals.length})</h3>
              <div className="goals-grid">
                {completedGoals.map(goal => (
                  <div key={goal.id} className="goal-card completed">
                    <div className="goal-card-header">
                      <span className="goal-status-badge" style={{ backgroundColor: STATUS_COLORS.completed }}>
                        Completed
                      </span>
                    </div>
                    <h4 className="goal-title">{goal.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {abandonedGoals.length > 0 && (
            <div className="goals-section">
              <h3 className="section-title">Abandoned ({abandonedGoals.length})</h3>
              <div className="goals-grid">
                {abandonedGoals.map(goal => (
                  <div key={goal.id} className="goal-card abandoned">
                    <div className="goal-card-header">
                      <span className="goal-status-badge" style={{ backgroundColor: STATUS_COLORS.abandoned }}>
                        Abandoned
                      </span>
                    </div>
                    <h4 className="goal-title">{goal.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
