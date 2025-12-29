import { createAdminClient } from '@/utils/supabase/admin'
import Link from 'next/link'
import { adminDeletePost, togglePostVisibility } from '../admin-actions'

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

    const { data: posts } = await query

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

            <div className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-zinc-400">
                        <tr>
                            <th className="p-4 font-medium">Title</th>
                            <th className="p-4 font-medium">Author</th>
                            <th className="p-4 font-medium">Group</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {posts?.map((post) => (
                            <tr key={post.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 max-w-xs">
                                    <Link href={`/p/${post.id}`} className="block truncate font-medium text-white hover:text-brand">
                                        {post.title}
                                    </Link>
                                    <div className="text-xs text-zinc-500 mt-1 truncate">{post.content}</div>
                                </td>
                                <td className="p-4 text-zinc-300">
                                    {post.author?.full_name || 'Unknown'}
                                </td>
                                <td className="p-4 text-zinc-400">
                                    {post.group?.name || 'General'}
                                </td>
                                <td className="p-4">
                                    {post.is_hidden ? (
                                        <span className="text-xs text-amber-500 font-medium">Hidden</span>
                                    ) : (
                                        <span className="text-xs text-green-500 font-medium">Visible</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <form action={togglePostVisibility}>
                                            <input type="hidden" name="postId" value={post.id} />
                                            <input type="hidden" name="isHidden" value={post.is_hidden ? 'true' : 'false'} />
                                            <button className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-white/5 hover:bg-white/10 rounded transition-colors">
                                                {post.is_hidden ? 'Show' : 'Hide'}
                                            </button>
                                        </form>
                                        <form action={adminDeletePost} onSubmit={(e) => !confirm('Delete post?') && e.preventDefault()}>
                                            <input type="hidden" name="postId" value={post.id} />
                                            <button className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded transition-colors">
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
