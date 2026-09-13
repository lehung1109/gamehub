import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!

  if (typeof window === 'undefined') {
    return createBrowserClient<Database>(supabaseUrl, supabaseKey)
  }

  if (!client) {
    client = createBrowserClient<Database>(supabaseUrl, supabaseKey)
  }

  return client
}
