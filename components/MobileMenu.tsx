'use client'

import { signout } from '@/app/auth/actions'

// ...

<div className="pt-6 border-t border-white/10">
    {user ? (
        <div className="space-y-4">
            <Link href="/profile" onClick={close} className="block text-zinc-400 hover:text-white">
                {dict.navbar.my}
            </Link>
            <form action={signout}>
                <button className="text-red-400 hover:text-red-300 w-full text-left">
                    {dict.navbar.signout}
                </button>
            </form>
            dict: any
            user: any
            points: number
}

            export default function MobileMenu({dict, user, points}: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
            const router = useRouter()

    const toggle = () => setIsOpen(!isOpen)
    const close = () => setIsOpen(false)

            return (
            <div className="sm:hidden">
                <button
                    onClick={toggle}
                    className="p-2 text-zinc-300 hover:text-white transition-colors"
                    aria-label="Menu"
                >
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    )}
                </button>

                {/* Menu Overlay */}
                {isOpen && (
                    <div className="fixed inset-0 top-[65px] z-50 bg-black/95 backdrop-blur-sm animate-in fade-in slide-in-from-top-5 duration-200">
                        <nav className="flex flex-col p-6 space-y-6">
                            {user && (
                                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg font-bold">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{user.email?.split('@')[0]}</div>
                                            <div className="text-xs text-brand font-medium flex items-center gap-1">
                                                {points.toLocaleString()} PTS
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <Link href="/news" onClick={close} className="block text-xl font-bold text-zinc-300 hover:text-white">
                                    {dict.navbar.news}
                                </Link>
                                <Link href="/community" onClick={close} className="block text-xl font-bold text-zinc-300 hover:text-white">
                                    {dict.navbar.community}
                                </Link>
                                <Link href="/shop" onClick={close} className="block text-xl font-bold text-zinc-300 hover:text-white">
                                    Shop
                                </Link>
                                <Link href="/write" onClick={close} className="block text-xl font-bold text-zinc-300 hover:text-white">
                                    {dict.navbar.write}
                                </Link>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                {user ? (
                                    <div className="space-y-4">
                                        <Link href="/profile" onClick={close} className="block text-zinc-400 hover:text-white">
                                            {dict.navbar.my}
                                        </Link>
                                        <form action="/auth/signout" method="post">
                                            {/* Note: In client component we might need fetch or router, 
                                             but form action to route handler works if defined, 
                                             however we are using server actions usually. 
                                             Let's use a button that reloads or standard link if needed.
                                             Actually, passing 'signout' server action as prop is hard in Client Comp if it's imported from server file directly? 
                                             We can't pass server action function to client component easily as prop unless it's bound.
                                             Let's simpler approach: Use a specific route handler or just standard form submission if 'signout' is exposed via route.
                                             
                                             Wait, I can import { signout } from '@/app/auth/actions' in Client Component? 
                                             Yes, if it has 'use server'.
                                             Let's try that.
                                         */}
                                            <button className="text-red-400 hover:text-red-300">
                                                {dict.navbar.signout}
                                            </button>
                                        </form>
                                        {user.email === 'jundae54@gmail.com' && (
                                            <Link href="/admin" onClick={close} className="block text-red-500 font-bold mt-4">
                                                ADMIN PANEL
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={close}
                                        className="block w-full py-3 text-center bg-brand text-white font-bold rounded-lg"
                                    >
                                        {dict.navbar.signin}
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
            )
}
