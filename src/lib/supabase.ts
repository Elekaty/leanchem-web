import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null
let serverClient: SupabaseClient | null = null

function readPublicSupabaseEnv(): { url?: string; key?: string } {
  const meta = import.meta.env as Record<string, string | undefined>
  return {
    url: meta.VITE_SUPABASE_URL || meta.NEXT_PUBLIC_SUPABASE_URL,
    key: meta.VITE_SUPABASE_ANON_KEY || meta.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

/** Browser / client Supabase (anon key). Supports VITE_* and NEXT_PUBLIC_* aliases. */
export function getSupabaseBrowser(): SupabaseClient | null {
  const { url, key } = readPublicSupabaseEnv()
  if (!url || !key) return null
  if (!browserClient) {
    browserClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return browserClient
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = readPublicSupabaseEnv()
  return Boolean(url && key)
}

/**
 * Server-side Supabase client.
 * Prefers service role for inserts/notifications; falls back to anon.
 */
export function getSupabaseServer(): SupabaseClient | null {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return null
  if (!serverClient) {
    serverClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return serverClient
}
