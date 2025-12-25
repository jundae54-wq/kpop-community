import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { signout } from '@/app/auth/actions'
import Notifications from './Notifications'
import { headers } from 'next/headers'
import { getDictionary } from '@/utils/get-dictionary'

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get locale from header (set by middleware)
    const headerList = await headers()
    const locale = headerList.get('x-locale') || 'en'
    const dict = await getDictionary(locale)

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icon-192.png" alt="K-Community" className="h-8 w-8 rounded-lg" />
                    <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">Community</span>
                </Link>

                <div className="flex items-center gap-1 sm:gap-4 text-xs sm:text-sm font-medium">
                    <Link href="/news" className="text-zinc-300 hover:text-white transition-colors px-2 py-2 sm:px-0 sm:py-0">
                        {dict.navbar.news}
                    </Link>
                    <Link href="/community" className="text-zinc-300 hover:text-white transition-colors px-2 py-2 sm:px-0 sm:py-0">
                        {dict.navbar.community}
                    </Link>
                    <Link href="/write" className="text-zinc-300 hover:text-white transition-colors px-2 py-2 sm:px-0 sm:py-0">
                        {dict.navbar.write}
                    </Link>

                    {user ? (
                        <>
                            <Notifications />
                            {user.email === 'jundae54@gmail.com' && (
                                <Link href="/admin" className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors bg-red-500/10 px-2 py-1 rounded">
                                    ADMIN
                                </Link>
                            )}
                            <div className="flex items-center gap-1 sm:gap-4 border-l border-white/10 pl-1 sm:pl-6">
                                <Link href="/profile" className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1 px-2 py-2 sm:px-0 sm:py-0">
                                    <span className="sm:hidden">{dict.navbar.my}</span>
                                    <span className="hidden sm:inline text-ellipsis max-w-[100px] overflow-hidden whitespace-nowrap">{user.email?.split('@')[0]}</span>
                                </Link>
                                <form action={signout}>
                                    <button className="text-red-400 hover:text-red-300 transition-colors flex items-center px-2 py-2 sm:px-0 sm:py-0">
                                        <span className="hidden sm:inline">{dict.navbar.signout}</span>
                                        <span className="sm:hidden">{dict.navbar.exit}</span>
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-4 border-l border-white/10 pl-2 sm:pl-6">
                            <Link href="/login" className="rounded-full bg-brand px-3 sm:px-4 py-1.5 text-white hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 whitespace-nowrap">
                                {dict.navbar.signin}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
