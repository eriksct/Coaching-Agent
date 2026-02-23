import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://drailjyobpnfjmjladpv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYWlsanlvYnBuZmptamxhZHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTk4NDQsImV4cCI6MjA4NzQzNTg0NH0.Vt52KbihZ224KNXk87HlwSU3lDYkesIYZq3dWIGuJXs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
