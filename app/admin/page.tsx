import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { deletePost } from './actions'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'jundae54@gmail.com'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== ADMIN_EMAIL) {
        redirect('/')
    }

    const supabaseAdmin = createAdminClient()

    // 1. Stats
    // note: listUsers returns pagination, for count we might need another way or just use length of page 1 if small, 
    // but better is to just show "Recent Users" count or no count if expensive. 
    // Actually listUsers() returns an object with users array. It doesn't give total count easily without iterating.
    // Let's just count profiles for display.
    const { count: profileCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
    const { count: postCount } = await supabaseAdmin.from('posts').select('*', { count: 'exact', head: true })
    const { count: commentCount } = await supabaseAdmin.from('comments').select('*', { count: 'exact', head: true })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-zinc-400">Welcome, Super Admin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/users" className="block p-6 rounded-2xl bg-zinc-800/50 border border-white/5 hover:bg-zinc-800 transition-colors group">
                    <h3 className="text-zinc-400 font-medium mb-2 group-hover:text-white">Total Users</h3>
                    <p className="text-4xl font-bold text-white">{profileCount || 0}</p>
                </Link>
                <Link href="/admin/posts" className="block p-6 rounded-2xl bg-zinc-800/50 border border-white/5 hover:bg-zinc-800 transition-colors group">
                    <h3 className="text-zinc-400 font-medium mb-2 group-hover:text-white">Total Posts</h3>
                    <p className="text-4xl font-bold text-white">{postCount || 0}</p>
                </Link>
                <Link href="/admin/comments" className="block p-6 rounded-2xl bg-zinc-800/50 border border-white/5 hover:bg-zinc-800 transition-colors group">
                    <h3 className="text-zinc-400 font-medium mb-2 group-hover:text-white">Total Comments</h3>
                    <p className="text-4xl font-bold text-white">{commentCount || 0}</p>
                </Link>
            </div>

            <div className="p-6 rounded-2xl bg-brand/10 border border-brand/20">
                <h3 className="text-brand font-bold mb-2">Quick Tips</h3>
                <ul className="list-disc list-inside text-sm text-brand/80 space-y-1">
                    <li>Use <strong>User Management</strong> to ban users or assign moderators.</li>
                    <li>Use <strong>Post Management</strong> to hide inappropriate content without deleting it.</li>
                    <li><strong>Comment Management</strong> lets you quickly moderate recent discussions.</li>
                </ul>
            </div>
        </div>
    )
}
