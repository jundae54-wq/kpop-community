import { createAdminClient } from '@/utils/supabase/admin'
import Link from 'next/link'
import { adminDeleteComment } from '../admin-actions'

export default async function AdminCommentsPage() {
    const supabaseAdmin = createAdminClient()

    const { data: comments, error } = await supabaseAdmin
        .from('comments')
        .select('*, author:profiles(full_name), post:posts(title, group:groups(name))')
        .order('created_at', { ascending: false })
        .limit(100)

    if (error || !comments) {
        console.error('Failed to list comments:', error)
        return (
            <div className="p-8 text-center bg-zinc-900 rounded-xl border border-red-500/20">
                <h3 className="text-red-400 font-bold mb-2">Failed to load comments</h3>
                <p className="text-zinc-400 text-sm">{error?.message || 'No data available'}</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Recent Comments</h1>
            <div className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-zinc-400">
                        <tr>
                            <th className="p-4 font-medium w-1/2">Content</th>
                            <th className="p-4 font-medium">Author</th>
                            <th className="p-4 font-medium">Post/Group</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {comments?.map((comment) => (
                            <tr key={comment.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="text-white line-clamp-2">{comment.content}</div>
                                    <div className="text-xs text-zinc-500 mt-1">
                                        {new Date(comment.created_at).toLocaleString()}
                                    </div>
                                </td>
                                <td className="p-4 text-zinc-300">
                                    {comment.author?.full_name || 'Unknown'}
                                </td>
                                <td className="p-4">
                                    <div className="text-zinc-400 text-xs">
                                        on <Link href={`/p/${comment.post_id}`} className="text-zinc-300 hover:text-white underline">{comment.post?.title}</Link>
                                    </div>
                                    <div className="text-zinc-500 text-[10px] mt-0.5">
                                        in {comment.post?.group?.name || 'General'}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <form action={adminDeleteComment} onSubmit={(e) => !confirm('Delete comment?') && e.preventDefault()}>
                                        <input type="hidden" name="commentId" value={comment.id} />
                                        <button className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded transition-colors">
                                            Delete
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
