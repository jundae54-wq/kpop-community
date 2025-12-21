import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { signout } from '@/app/auth/actions'
import Notifications from './Notifications'

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white font-bold shadow-lg shadow-brand/20">
                        K
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">Community</span>
                </Link>

                <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-medium">
                    <Link href="/news" className="text-zinc-300 hover:text-white transition-colors">
                        News
                    </Link>
                    <Link href="/community" className="text-zinc-300 hover:text-white transition-colors">
                        Comm<span className="hidden sm:inline">unity</span>
                    </Link>
                    <Link href="/write" className="text-zinc-300 hover:text-white transition-colors">
                        Write
                    </Link>

                    {user ? (
                        <>
                            <Notifications />
                            {user.email === 'jundae54@gmail.com' && (
                                <Link href="/admin" className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors bg-red-500/10 px-2 py-1 rounded hidden sm:inline-block">
                                    ADMIN
                                </Link>
                            )}
                            <div className="flex items-center gap-2 sm:gap-4 border-l border-white/10 pl-2 sm:pl-6">
                                <Link href="/profile" className="text-xs text-zinc-400 hidden sm:block hover:text-white transition-colors">
                                    {user.email?.split('@')[0]}
                                </Link>
                                <form action={signout}>
                                    <button className="text-red-400 hover:text-red-300 transition-colors flex items-center">
                                        <span className="hidden sm:inline">Sign Out</span>
                                        <span className="sm:hidden">Exit</span>
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-4 border-l border-white/10 pl-2 sm:pl-6">
                            <Link href="/login" className="rounded-full bg-brand px-3 sm:px-4 py-1.5 text-white hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 whitespace-nowrap">
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
