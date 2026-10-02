import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const supabase = url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } }) : null

export async function signInWithSupabase(email: string, password: string) {
  if (!supabase) return { error: null, demo: true }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error, demo: false }
}

export async function sendPasswordReset(email: string) {
  if (!supabase) return { error: new Error('邮件服务尚未配置') }
  const redirectTo = `${window.location.origin}/admin/login`
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  return { error }
}

export async function signOutSupabase() {
  if (supabase) await supabase.auth.signOut()
}
