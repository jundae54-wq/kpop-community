import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Post } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
    const supabase = await createClient()

    // Logic: "News" = Automated posts = No specific group assigned (group_id is null)
    // OR we could check for a specific 'News' group if we created one.
    // Based on current cron logic, group_id is null.

    const { data: posts } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles(*),
            group:groups(*)
        `)
        .like('content', '%Source: [Soompi]%') // Identify news by source signature
        .order('created_at', { ascending: false })

    return (
        <div className="mx-auto max-w-2xl py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white">Últimas Notícias K-Pop</h1>
                <p className="mt-1 text-zinc-300">Atualizações diárias automáticas.</p>
            </div>

            {/* Feed */}
            <div className="space-y-6">
                {(!posts || posts.length === 0) ? (
                    <EmptyState />
                ) : (
                    posts.map((post: Post) => (
                        <PostCard key={post.id} post={post} />
                    ))
                )}
            </div>
        </div>
    )
}

function PostCard({ post }: { post: Post }) {
    return (
        <Link href={`/p/${post.id}`} className="block group">
            <article className="rounded-xl border border-white/10 bg-zinc-900/50 p-5 transition-all hover:bg-zinc-800/50 hover:border-brand/30">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
                        {/* News usually has no user avatar, or bot avatar */}
                        {post.group ? (
                            <div className="h-full w-full flex items-center justify-center text-xs font-bold text-white bg-brand">
                                {post.group.name.substring(0, 1)}
                            </div>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs font-bold text-zinc-400 bg-brand/20 text-brand">
                                N
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">
                                {post.group ? post.group.name : 'K-Community Bot'}
                            </p>
                            {post.group && (
                                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
                                    {post.group.type === 'idol' ? 'Idol' : 'Actor'}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-zinc-500">
                            {new Date(post.created_at).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-white group-hover:text-brand transition-colors">
                    {post.title}
                </h3>

                <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                    {post.content}
                </p>

                {/* Image hidden for copyright safety */}
                {/* {post.image_url && (
                    <div className="mt-4 overflow-hidden rounded-lg">
                        <img src={post.image_url} alt="" className="h-48 w-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    </div>
                )} */}
            </article>
        </Link>
    )
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/20 py-20 text-center">
            <div className="rounded-full bg-zinc-800 p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Nenhuma notícia ainda</h3>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2">
                Aguardando o ciclo diário.
            </p>
        </div>
    )
}
