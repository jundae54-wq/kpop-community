import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    // 1. Supabase Auth (Preserve existing logic)
    const response = await updateSession(request)

    // 2. Localization Logic
    // Default to 'en'
    let locale = 'en'

    // Check Vercel Country Header (BR = Brazil)
    const country = request.headers.get('x-vercel-ip-country')
    if (country === 'BR') {
        locale = 'pt'
    }

    // Set header for server components to read
    response.headers.set('x-locale', locale)

    // Also set a cookie for client components if needed
    response.cookies.set('NEXT_LOCALE', locale)

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
