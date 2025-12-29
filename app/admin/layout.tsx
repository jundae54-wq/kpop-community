import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

const ADMIN_EMAIL = 'jundae54@gmail.com'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== ADMIN_EMAIL) {
        redirect('/')
    }

    return (
        <div className="mx-auto max-w-7xl min-h-screen py-8 px-4 flex gap-8">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex-shrink-0">
                <div className="sticky top-8">
                    <h2 className="text-xl font-bold text-white mb-6 px-2">Admin Panel</h2>
                    <nav className="space-y-1">
                        <Link href="/admin" className="block px-3 py-2 text-sm font-medium rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/admin/users" className="block px-3 py-2 text-sm font-medium rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                            User Management
                        </Link>
                        <Link href="/admin/posts" className="block px-3 py-2 text-sm font-medium rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                            Post Management
                        </Link>
                        <Link href="/admin/comments" className="block px-3 py-2 text-sm font-medium rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                            Comment Management
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-zinc-900/30 rounded-2xl border border-white/5 p-6 min-h-[80vh]">
                {children}
            </main>
        </div>
    )
}
