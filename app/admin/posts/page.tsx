import { createAdminClient } from '@/utils/supabase/admin'
import Link from 'next/link'
import { adminDeletePost, togglePostVisibility } from '../admin-actions'
import { ConfirmDeleteButton } from '@/components/admin/ConfirmDeleteButton'
import AdminPostList from './AdminPostList'

export const dynamic = 'force-dynamic'

export default async function AdminPostsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabaseAdmin = createAdminClient()
    const { category } = await searchParams

    let query = supabaseAdmin
        .from('posts')
        .select('*, author:profiles(full_name), group:groups(name)')
        .order('created_at', { ascending: false })

    if (category) {
        query = query.eq('group_id', category)
    }

    const { data: posts, error } = await query

    if (error || !posts) {
        console.error('Failed to list posts:', error)
        return (
            <div className="p-8 text-center bg-zinc-900 rounded-xl border border-red-500/20">
                <h3 className="text-red-400 font-bold mb-2">Failed to load posts</h3>
                <p className="text-zinc-400 text-sm">{error?.message || 'No data available'}</p>
            </div>
        )
    }

    // Fetch groups for filter
    const { data: groups } = await supabaseAdmin.from('groups').select('*').order('name')

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Post Management</h1>
                <div className="flex gap-2">
                    <Link href="/admin/posts" className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${!category ? 'bg-brand text-white' : 'bg-white/5 text-zinc-400 hover:text-white'}`}>
                        All
                    </Link>
                    {groups?.map(g => (
                        <Link
                            key={g.id}
                            href={`/admin/posts?category=${g.id}`}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${Number(category) === g.id ? 'bg-brand text-white' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
                        >
                            {g.name}
                        </Link>
                    ))}
                </div>
            </div>

            <AdminPostList initialPosts={posts} />
        </div>
    )
}
