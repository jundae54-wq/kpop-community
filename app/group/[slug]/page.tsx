import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Post } from '@/types/database'

export default async function GroupPage({ params }: { params: { slug: string } }) {
    const supabase = await createClient()
    const { slug } = await params

    // 1. Fetch Group Info
    const { data: group } = await supabase
        .from('groups')
        .select('*')
        .eq('slug', slug)
        .single()

    if (!group) {
        notFound()
    }

    // 2. Fetch Posts for this Group
    const { data: posts } = await supabase
        .from('posts')
        .select(`
      *,
      author:profiles(*),
      group:groups(*)
    `)
        .eq('group_id', group.id)
        .order('created_at', { ascending: false })

    return (
        <div className="mx-auto max-w-2xl py-8 px-4">
            {/* Group Header */}
            <div className="mb-8 rounded-2xl bg-gradient-to-r from-brand/20 to-accent/20 p-8 text-center ring-1 ring-white/10">
                <h1 className="text-4xl font-bold text-white mb-2">{group.name}</h1>
                <p className="text-zinc-300">{group.description || 'Community Board'}</p>
            </div>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Latest Posts</h2>
                <Link
                    href={`/write?group=${group.id}`} // Setup query param support in /write if needed
                    className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all"
                >
                    Write to {group.name}
                </Link>
            </div>

            {/* Feed */}
            <div className="space-y-6">
                {(!posts || posts.length === 0) ? (
                    <div className="text-center py-12 text-zinc-500">
                        No posts in this group yet. Be the first!
                    </div>
                ) : (
                    posts.map((post: Post) => (
                        <Link key={post.id} href={`/p/${post.id}`} className="block group">
                            <article className="rounded-xl border border-white/10 bg-zinc-900/50 p-5 transition-all hover:bg-zinc-800/50 hover:border-brand/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-8 w-8 rounded-full bg-zinc-700 overflow-hidden">
                                        {post.author?.avatar_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={post.author.avatar_url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center font-bold text-xs text-zinc-400">
                                                {post.author?.full_name?.substring(0, 1) || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{post.author?.full_name}</p>
                                        <p className="text-xs text-zinc-500">{new Date(post.created_at).toLocaleDateString()}</p>
                                    </div>
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
