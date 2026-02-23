export interface UserProfile {
  id: string
  email: string
  display_name: string | null
  financial_situation: Record<string, unknown>
  financial_literacy_level: 'beginner' | 'intermediate' | 'advanced'
  coaching_preferences: Record<string, unknown>
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_value: number | null
  target_unit: string | null
  deadline: string | null
  status: 'active' | 'on_track' | 'behind' | 'completed' | 'abandoned'
  domain: 'budgeting' | 'debt' | 'saving' | 'investing' | 'income' | null
  created_at: string
  updated_at: string
  completion_notes: string | null
}

export interface Session {
  id: string
  user_id: string
  started_at: string
  ended_at: string | null
  is_onboarding: boolean
  created_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
