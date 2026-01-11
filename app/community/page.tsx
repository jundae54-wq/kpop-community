import { createClient } from '@/utils/supabase/server'
import { BadgeRenderer } from '@/components/BadgeRenderer'
import { Post } from '@/types/database'
import Link from 'next/link'
import GroupSelector from '@/components/GroupSelector'

export default async function CommunityPage(props: {
    searchParams: Promise<{ type?: string; category?: string }>
}) {
    const searchParams = await props.searchParams
    const supabase = await createClient()
    const type = searchParams.type // 'idol' | 'actor'
    const categoryId = searchParams.category ? parseInt(searchParams.category) : null

    // 1. Fetch Trending Post (Most views in last 24h)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: trendingPosts } = await supabase
        .from('posts')
        .select(`*, author:profiles(*), group:groups(*)`)
        .not('group_id', 'is', null) // Only community posts
        .gte('created_at', yesterday.toISOString())
        .order('views', { ascending: false })
        .limit(1)

    const trendingPost = trendingPosts && trendingPosts.length > 0 ? trendingPosts[0] : null

    // 2. Fetch Groups for Sub-categories
    const { data: groups } = await supabase
        .from('groups')
        .select('*')
        .order('name')

    const idols = groups?.filter(g => g.type === 'idol') || []
    const actors = groups?.filter(g => g.type === 'actor') || []

    // 3. Filtered Groups based on selection
    const visibleGroups = type === 'idol' ? idols : type === 'actor' ? actors : []

    // 4. Main Feed Query
    let query = supabase
        .from('posts')
        .select(`
            *, 
            author:profiles(id, full_name, active_effect, badge_left, badge_right, avatar_url), 
            group:groups(*, group_moderators(user_id)), 
            comments:comments(count)
        `)
        .not('group_id', 'is', null)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

    const { data: posts } = await query

    // Filter in memory for MVP
    const filteredPosts = posts?.filter((p: any) => {
        if (categoryId) return p.group_id === categoryId
        if (type) return p.group?.type === type
        return true
    }) || []

    return (
        <div className="mx-auto max-w-2xl py-8 px-4">
            {/* 1. Trending Section */}
            <div className="mb-10">
                <h2 className="text-lg font-bold text-brand mb-4 flex items-center gap-2">
                    🔥 Destaques do Dia
                </h2>
                {trendingPost ? (
                    <PostCard post={trendingPost} highlight groups={groups || []} />
                ) : (
                    <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-6 text-center text-zinc-500 text-sm">
                        Nenhum destaque hoje ainda.
                    </div>
                )}
            </div>

            {/* 2. Type Navigation (Idol / Actor) */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Link
                    href="/community?type=idol"
                    className={`relative overflow-hidden flex h-24 flex-col items-center justify-center rounded-2xl border transition-all duration-300 group ${type === 'idol' ? 'border-brand bg-brand/10 ring-1 ring-brand' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-800'}`}
                >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-brand to-purple-600`} />
                    <span className="text-3xl mb-1">🎤</span>
                    <span className={`text-lg font-bold tracking-wide ${type === 'idol' ? 'text-brand' : 'text-zinc-400 group-hover:text-white'}`}>ÍDOLOS</span>
                </Link>
                <Link
                    href="/community?type=actor"
                    className={`relative overflow-hidden flex h-24 flex-col items-center justify-center rounded-2xl border transition-all duration-300 group ${type === 'actor' ? 'border-brand bg-brand/10 ring-1 ring-brand' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-800'}`}
                >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-blue-500 to-cyan-500`} />
                    <span className="text-3xl mb-1">🎬</span>
                    <span className={`text-lg font-bold tracking-wide ${type === 'actor' ? 'text-brand' : 'text-zinc-400 group-hover:text-white'}`}>ATORES</span>
                </Link>
            </div>

            {/* 3. Group Selector (Search + Filter) */}
            {type && visibleGroups.length > 0 && (
                <GroupSelector
                    groups={visibleGroups}
                    type={type as 'idol' | 'actor'}
                    activeCategoryId={categoryId}
                />
            )}

            {/* 4. Feed */}
            <h3 className="text-white font-bold mb-4">
                {categoryId ? 'Posts do Grupo' : type ? `Posts de ${type === 'idol' ? 'Ídolos' : 'Atores'}` : 'Posts Recentes'}
            </h3>
            <div className="space-y-6">
                {(!filteredPosts || filteredPosts.length === 0) ? (
                    <EmptyState categoryId={categoryId} />
                ) : (
                    filteredPosts.map((post: Post) => (
                        <PostCard key={post.id} post={post} groups={groups || []} />
                    ))
                )}
            </div>
        </div>
    )
}

function PostCard({ post, highlight = false, groups = [] }: { post: Post & { group?: any }, highlight?: boolean, groups?: any[] }) {
    // Check if author is moderator
    const isModerator = post.group?.group_moderators?.some((m: any) => m.user_id === post.author?.id)

    return (
        <article className={`relative rounded-xl border bg-zinc-900/50 p-5 transition-all hover:bg-zinc-800/50 group ${highlight ? 'border-brand/50 shadow-lg shadow-brand/10' : 'border-white/10 hover:border-brand/30'}`}>
            {/* Main Post Link (Overlay) */}
            <Link href={`/p/${post.id}`} className="absolute inset-0 z-0" aria-label={`View post: ${post.title}`} />

            <div className="flex items-center gap-3 mb-3 relative">
                <div className="h-8 w-8 rounded-full bg-zinc-700 overflow-hidden relative z-0">
                    {post.author?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.author.avatar_url} alt={post.author.username || 'User'} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs font-bold text-zinc-400">
                            {post.author?.full_name?.substring(0, 1) || '?'}
                        </div>
                    )}
                </div>
                <div className="relative z-0">
                    <div className="flex items-center">
                        {/* Gold Badge for Moderators */}
                        {isModerator && post.group && (
                            <BadgeRenderer badgeId={`badge_${post.group.id}`} groups={groups} variant="gold" />
                        )}

                        <BadgeRenderer badgeId={post.author?.badge_left} groups={groups} />
                        <p className={`text-sm font-medium text-white px-1 ${post.author?.active_effect || ''}`}>
                            {post.author?.full_name || 'Anônimo'}
                        </p>
                        <BadgeRenderer badgeId={post.author?.badge_right} groups={groups} />
                    </div>
                    <p className="text-xs text-zinc-500">
                        {new Date(post.created_at).toLocaleDateString()}
                    </p>
                </div>
                {post.group && (
                    <Link
                        href={`/community?category=${post.group.id}&type=${post.group.type}`}
                        className="ml-auto rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors relative z-10"
                    >
                        {post.group.name}
                    </Link>
                )}
            </div>

            <h3 className={`text-lg font-semibold text-white group-hover:text-brand transition-colors relative z-0 ${highlight ? 'text-xl' : ''}`}>
                {post.title}
            </h3>

            <p className="mt-2 text-sm text-zinc-400 line-clamp-2 relative z-0">
                {post.content}
            </p>

            {highlight && (
                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 relative z-0">
                    <span>🔥 Em Alta</span>
                    <span>•</span>
                    <span>{post.views || 0} visualizações</span>
                </div>
            )}

            {post.is_pinned && (
                <div className="absolute top-3 right-3 text-yellow-500 bg-yellow-500/10 p-1.5 rounded-full border border-yellow-500/20 shadow-sm z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M10 2c-1.1 0-2 .9-2 2v2.586l-1.293 1.293A1 1 0 006 8.586V11h3v6h2v-6h3v-2.414a1 1 0 00-.293-.707L12 6.586V4c0-1.1-.9-2-2-2z" />
                    </svg>
                </div>
            )}
        </article>
    )
}

function EmptyState({ categoryId }: { categoryId: number | null }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/20 py-20 text-center">
            <div className="rounded-full bg-zinc-800 p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Nenhum post ainda</h3>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2 mb-6">
                Seja o primeiro fã a começar uma discussão!
            </p>
            <Link
                href={categoryId ? `/write?group_id=${categoryId}` : '/write'}
                className="bg-brand text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-brand/90 transition-colors"
            >
                Criar Post
            </Link>
        </div>
    )
}
