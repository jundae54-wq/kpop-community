import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { deletePost } from './actions'

const ADMIN_EMAIL = 'jundae54@gmail.com'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== ADMIN_EMAIL) {
        redirect('/')
    }

    const supabaseAdmin = createAdminClient()

    // 1. Fetch Users (with emails)
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

    // 2. Fetch Recent Posts
    const { data: posts } = await supabaseAdmin
        .from('posts')
        .select('*, author:profiles(full_name), group:groups(name)')
        .order('created_at', { ascending: false })
        .limit(50)

    // 3. Fetch Moderators (to badge users)
    const { data: moderators } = await supabaseAdmin
        .from('group_moderators')
        .select('user_id')

    const moderatorIds = new Set(moderators?.map(m => m.user_id))

    return (
        <div className="mx-auto max-w-7xl py-8 px-4 space-y-12">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-zinc-400">Welcome, Super Admin.</p>
            </div>

            {/* Section 1: User Management */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">User Management</h2>
                    <span className="text-sm text-zinc-500">{users?.length || 0} users total</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-zinc-400">
                                <tr>
                                    <th className="p-4 font-medium">Email</th>
                                    <th className="p-4 font-medium">Joined</th>
                                    <th className="p-4 font-medium">Last Sign In</th>
                                    <th className="p-4 font-medium">Role</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users?.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium">{u.email}</span>
                                                <span className="text-zinc-500 text-xs">{u.id}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-zinc-400">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-zinc-400">
                                            {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="p-4">
                                            {u.email === ADMIN_EMAIL ? (
                                                <span className="inline-flex items-center rounded-full bg-purple-400/10 px-2 py-1 text-xs font-medium text-purple-400 ring-1 ring-inset ring-purple-400/20">
                                                    Super Admin
                                                </span>
                                            ) : moderatorIds.has(u.id) ? (
                                                <span className="inline-flex items-center rounded-full bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20">
                                                    Moderator
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-zinc-400/10 px-2 py-1 text-xs font-medium text-zinc-400 ring-1 ring-inset ring-zinc-400/20">
                                                    User
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                href={`/admin/user/${u.id}`}
                                                className="text-brand hover:text-brand/80 font-medium"
                                            >
                                                Manage Permissions
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Section 2: Content Management */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Recent Posts</h2>
                    <Link href="/" className="text-sm text-brand hover:text-brand/80">View All on Site →</Link>
                </div>

                <div className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-zinc-400">
                            <tr>
                                <th className="p-4 font-medium">Title</th>
                                <th className="p-4 font-medium">Author</th>
                                <th className="p-4 font-medium">Group</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {posts?.map((post) => (
                                <tr key={post.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <Link href={`/p/${post.id}`} className="text-white hover:text-brand transition-colors block max-w-xs truncate">
                                            {post.title}
                                        </Link>
                                    </td>
                                    <td className="p-4 text-zinc-300">
                                        {post.author?.full_name || 'Unknown'}
                                    </td>
                                    <td className="p-4 text-zinc-400">
                                        {post.group?.name || 'General'}
                                    </td>
                                    <td className="p-4 text-zinc-500">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <form action={deletePost}>
                                            <input type="hidden" name="postId" value={post.id} />
                                            <button className="text-red-400 hover:text-red-300 font-medium text-xs bg-red-400/10 px-3 py-1.5 rounded-lg transition-colors">
                                                Delete
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                            {(!posts || posts.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                                        No posts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}
