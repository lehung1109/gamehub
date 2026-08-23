import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

  if (!serviceRoleKey) {
    console.warn(
      '[createAdminClient] Warning: SUPABASE_SERVICE_ROLE_KEY is missing. Using anon key fallback for local development.'
    )
  }

  const key =
    serviceRoleKey ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'dummy-service-role-key-for-dev'

  return createClient<Database>(
    supabaseUrl,
    key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
