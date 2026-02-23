import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { sendMessage } from '../lib/coaching'
import type { ChatMessage, UserProfile, Goal } from '../lib/types'

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isOnboarding = profile !== null && !profile.onboarding_completed

  useEffect(() => {
    loadUserData()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  async function loadUserData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData as UserProfile)
    }

    const { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'on_track', 'behind'])

    if (goalsData) {
      setGoals(goalsData as Goal[])
    }

    // Create a new session
    const { data: session } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        is_onboarding: profileData && !profileData.onboarding_completed,
      })
      .select()
      .single()

    if (session) {
      setSessionId(session.id)
    }

    // Send initial greeting if onboarding
    if (profileData && !profileData.onboarding_completed) {
      setLoading(true)
      try {
        const greeting = await sendMessage([], profileData as UserProfile, [], true)
        setMessages([{ role: 'assistant', content: greeting }])
      } catch {
        setMessages([{
          role: 'assistant',
          content: "Welcome! I'm your personal finance coach. I'm here to help you build better financial habits and reach your goals. Let's start by getting to know each other — what's your name, and what brought you here today?",
        }])
      }
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await sendMessage(newMessages, profile, goals, isOnboarding)
      setMessages([...newMessages, { role: 'assistant', content: response }])

      // After several exchanges during onboarding, mark as completed
      if (isOnboarding && newMessages.filter(m => m.role === 'user').length >= 5) {
        await supabase
          .from('users')
          .update({ onboarding_completed: true })
          .eq('id', profile!.id)
        setProfile({ ...profile!, onboarding_completed: true })
      }
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: err instanceof Error ? err.message : "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
      }])
    }

    setLoading(false)
  }

  async function handleEndSession() {
    if (sessionId) {
      await supabase
        .from('sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', sessionId)
    }
    setMessages([])
    setSessionId(null)
    loadUserData()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>{isOnboarding ? 'Welcome! Let\'s get started' : 'Coaching Session'}</h2>
        {messages.length > 0 && (
          <button onClick={handleEndSession} className="end-session-btn">
            End Session
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && !loading && !isOnboarding && (
          <div className="chat-empty">
            <div className="chat-empty-icon">$</div>
            <h3>Ready for your coaching session?</h3>
            <p>Share what's on your mind — a financial goal, a challenge you're facing, or just check in on your progress.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            {msg.role === 'assistant' && <div className="message-avatar">$</div>}
            <div className="message-bubble">
              {msg.content.split('\n').map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message assistant">
            <div className="message-avatar">$</div>
            <div className="message-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-disclaimer">
          Educational coaching only — not licensed financial advice.
        </div>
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isOnboarding ? 'Tell me about yourself...' : 'Type your message...'}
            rows={1}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="send-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
