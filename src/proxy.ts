// src/proxy.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

function isValidAdminRedirect(path: string | null): boolean {
  if (!path) return false
  // Must start with /admin or /admin/ and not be protocol-relative (//)
  return (
    (path === '/admin' || path.startsWith('/admin/')) &&
    !path.startsWith('//')
  )
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Use getUser() instead of getSession() for server-verified authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // 1. Protect all /admin routes (preserve full path with search query, clear direct query params on /login)
  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const fullRedirectPath = pathname + request.nextUrl.search
    url.search = ''
    url.searchParams.set('redirect', fullRedirectPath)
    return NextResponse.redirect(url)
  }

  // 2. Redirect logged-in user away from /login
  if (pathname === '/login' && user) {
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    const target = isValidAdminRedirect(redirectParam)
      ? redirectParam!
      : '/admin/dashboard'

    const url = new URL(target, request.nextUrl.origin)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static file extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .mp3, .wav, .ogg, .json)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|wav|ogg|json)).*)',
  ],
}
