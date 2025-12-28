import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { deletePost, deleteComment, toggleModerator } from '../../actions'

const ADMIN_EMAIL = 'jundae54@gmail.com'

export default async function AdminUserPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== ADMIN_EMAIL) {
        redirect('/')
    }

    const userId = params.id

    // Fetch profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()

    // Fetch all groups (for moderator assignment)
    const { data: groups } = await supabase.from('groups').select('*').order('name')

    // Fetch existing moderator permissions for this user
    const { data: moderators } = await supabase
        .from('group_moderators')
        .select('group_id')
        .eq('user_id', userId)

    // Fetch posts
    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })

    // Fetch comments
    // Note: Comments might not have a direct relation if not set up, but let's assume they do have 'author_id'.
    // Checking previous steps: 'comments' table has 'author_id'.
    const { data: comments } = await supabase
        .from('comments')
        .select('*, post:posts(title)')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })

    return (
        <div className="mx-auto max-w-5xl py-8 px-4">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>

            {/* Profile Header */}
            <div className="mb-8 flex items-center gap-6 rounded-2xl bg-zinc-900/50 p-8 border border-white/5">
                <div className="h-20 w-20 rounded-full bg-zinc-800 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {profile?.avatar_url && <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">{profile?.full_name || 'Anonymous'}</h1>
                    <p className="text-sm font-mono text-zinc-500">{userId}</p>
                </div>
            </div>

            {/* Moderator Permissions */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-white mb-4">Moderator Permissions</h2>
                <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-6">
                    <p className="text-sm text-zinc-400 mb-4">
                        Assign this user as a "Category Head" to manage content within specific groups.
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {groups?.map((group) => {
                            const isMod = moderators?.some(m => m.group_id === group.id)
                            return (
                                <div key={group.id} className={`flex items-center justify-between p-3 rounded-lg border ${isMod ? 'bg-brand/10 border-brand/30' : 'bg-zinc-800/50 border-white/5'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-medium ${isMod ? 'text-brand' : 'text-zinc-300'}`}>
                                            {group.name}
                                        </span>
                                        <span className="text-xs text-zinc-500 uppercase">
                                            {group.type}
                                        </span>
                                    </div>
                                    <form action={toggleModerator}>
                                        <input type="hidden" name="userId" value={userId} />
                                        <input type="hidden" name="groupId" value={group.id} />
                                        <input type="hidden" name="isModerator" value={isMod ? 'true' : 'false'} />
                                        <button
                                            className={`text-xs px-2 py-1 rounded transition-colors ${isMod
                                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {isMod ? 'Remove' : 'Assign'}
                                        </button>
                                    </form>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Posts */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4">Posts ({posts?.length || 0})</h2>
                    <div className="space-y-4">
                        {posts?.map((post) => (
                            <div key={post.id} className="rounded-xl border border-white/5 bg-zinc-900/30 p-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h3 className="font-medium text-white line-clamp-1">{post.title}</h3>
                                        <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{post.content}</p>
                                        <span className="text-xs text-zinc-600 mt-2 block">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <form action={deletePost}>
                                        <input type="hidden" name="postId" value={post.id} />
                                        <input type="hidden" name="redirectUrl" value={`/admin/user/${userId}`} />
                                        <button className="text-xs text-red-500 hover:text-red-400 bg-red-500/10 px-2 py-1 rounded">
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comments */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4">Comments ({comments?.length || 0})</h2>
                    <div className="space-y-4">
                        {comments?.map((comment) => (
                            <div key={comment.id} className="rounded-xl border border-white/5 bg-zinc-900/30 p-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <p className="text-sm text-zinc-300">{comment.content}</p>
                                        <div className="mt-2 text-xs text-zinc-500">
                                            on <span className="text-zinc-400">{comment.post?.title || 'Unknown Post'}</span>
                                        </div>
                                    </div>
                                    <form action={deleteComment}>
                                        <input type="hidden" name="commentId" value={comment.id} />
                                        <input type="hidden" name="fromAdmin" value="true" />
                                        <input type="hidden" name="redirectUrl" value={`/admin/user/${userId}`} />
                                        <button className="text-xs text-red-500 hover:text-red-400 bg-red-500/10 px-2 py-1 rounded">
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
