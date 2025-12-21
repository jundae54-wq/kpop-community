import ProfileEditor from '@/components/ProfileEditor'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Post } from '@/types/database'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user profile data specifically to get full fields
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    // Fetch user posts
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles(*),
            group:groups(*)
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

    // Combine auth user with profile data
    const userData = {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name,
        avatar_url: profile?.avatar_url
    }

    return (
        <div className="mx-auto max-w-2xl py-8 px-4">
            {/* Editor Section */}
            <ProfileEditor user={userData} />

            <h2 className="text-xl font-bold text-white mb-6">My Posts</h2>

            {/* Feed */}
            <div className="space-y-6">
                {(!posts || posts.length === 0) ? (
                    <div className="text-center py-12 rounded-xl border border-dashed border-white/10">
                        <p className="text-zinc-400">You haven't written any posts yet.</p>
                        <Link href="/write" className="mt-4 inline-block text-brand hover:text-brand/80">
                            Write your first post
                        </Link>
                    </div>
                ) : (
                    posts.map((post: Post) => (
                        <Link key={post.id} href={`/p/${post.id}`} className="block group">
                            <article className="rounded-xl border border-white/10 bg-zinc-900/50 p-5 transition-all hover:bg-zinc-800/50 hover:border-brand/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="text-xs text-zinc-500">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </div>
                                    {post.group && (
                                        <span className="ml-auto rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                                            {post.group.name}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-semibold text-white group-hover:text-brand transition-colors">
                                    {post.title}
                                </h3>

                                <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                                    {post.content}
                                </p>
                            </article>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
