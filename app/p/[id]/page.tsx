import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { createComment, deletePost, deleteComment } from '@/app/auth/actions'
import { Post, Comment } from '@/types/database'
import { Metadata, ResolvingMetadata } from 'next'
import ViewTracker from '@/components/ViewTracker'
import { BadgeRenderer } from '@/components/BadgeRenderer'
import { SubmitButton } from '@/components/SubmitButton'

type Props = {
    params: Promise<{ id: string }>
}

const ADMIN_EMAIL = 'jundae54@gmail.com'

export async function generateMetadata(
    props: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const params = await props.params
    const id = params.id
    const supabase = await createClient()

    const { data: post } = await supabase.from('posts').select('*').eq('id', id).single()

    if (!post) {
        return {
            title: 'Post Not Found | K-Community',
        }
    }

    return {
        title: `${post.title} | K-Community`,
        description: post.content?.substring(0, 160) || 'Check out this K-pop news!',
        openGraph: {
            title: post.title,
            description: post.content?.substring(0, 160),
            images: post.image_url ? [post.image_url] : [],
        },
    }
}

export default async function PostPage(props: Props) {
    const params = await props.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { id } = params

    // Fetch Groups (for badges)
    const { data: groups } = await supabase.from('groups').select('*')

    // Fetch Post
    const { data: post } = await supabase
        .from('posts')
        .select(`*, author:profiles(id, full_name, active_effect, avatar_url, username, badge_left, badge_right), group:groups(*, group_moderators(user_id))`)
        .eq('id', id)
        .single()

    if (!post) {
        notFound()
    }

    // Check Permissions
    const isAuthor = user?.id === post.author_id
    const isSuperAdmin = user?.email === ADMIN_EMAIL
    let isModerator = false

    if (user && post.group_id) {
        const { data: mod } = await supabase
            .from('group_moderators')
            .select('*')
            .eq('user_id', user.id)
            .eq('group_id', post.group_id)
            .single()
        if (mod) isModerator = true
    }

    const canDeletePost = isAuthor || isSuperAdmin || isModerator

    // Fetch Comments
    const { data: comments } = await supabase
        .from('comments')
        .select(`*, author:profiles(full_name, active_effect, avatar_url, username, badge_left, badge_right)`)
        .eq('post_id', id)
        .order('created_at', { ascending: true })

    return (
        <div className="mx-auto max-w-3xl py-8 sm:py-12 px-4">
            <ViewTracker postId={post.id} />
            {/* Post Content */}
            <article className="mb-8 sm:mb-12">
                <header className="mb-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                            {post.group && <span className="text-brand font-medium">#{post.group.name}</span>}
                            {!post.group && <span className="text-brand font-medium">📰 Notícia</span>}
                            <span>•</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        {canDeletePost && (
                            <form action={deletePost}>
                                <input type="hidden" name="postId" value={post.id} />
                                <button className="text-xs text-red-500 hover:text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">
                                    Excluir Post
                                </button>
                            </form>
                        )}
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-zinc-700 overflow-hidden">
                            {!post.group ? (
                                <div className="h-full w-full flex items-center justify-center text-xs font-bold text-brand bg-brand/20">
                                    N
                                </div>
                            ) : post.author?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={post.author.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center font-bold text-zinc-400">
                                    {post.author?.full_name?.substring(0, 1) || '?'}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center bg-zinc-900/50 rounded-lg pr-2 max-w-fit">
                                {post.group && post.group.group_moderators?.some((m: any) => m.user_id === post.author?.id) && (
                                    <BadgeRenderer badgeId={`badge_${post.group.id}`} groups={groups || []} variant="gold" />
                                )}
                                <BadgeRenderer badgeId={post.author?.badge_left} groups={groups || []} />
                                <p className={`text-white font-medium px-1 ${post.author && 'active_effect' in post.author && post.author.active_effect === 'shiny_nickname' ? 'shiny-text' : ''}`}>
                                    {!post.group ? 'K-Community Bot' : (post.author?.full_name || 'Anônimo')}
                                </p>
                                <BadgeRenderer badgeId={post.author?.badge_right} groups={groups || []} />
                            </div>
                            <p className="text-zinc-500 text-sm mt-0.5">Autor</p>
                        </div>
                    </div>
                </header>

                <div className="prose prose-invert prose-lg max-w-none text-zinc-300 whitespace-pre-wrap">
                    {post.content}
                </div>

                {/* Category CTA */}
                {post.group && (
                    <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-brand/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand/10 rounded-full blur-2xl group-hover:bg-brand/20 transition-all"></div>

                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-white mb-2">
                                Fã de {post.group.name}?
                            </h3>
                            <p className="text-zinc-400 text-sm mb-4">
                                Junte-se à comunidade de {post.group.name} para discutir as últimas novidades, compartilhar fotos e conhecer outros fãs!
                            </p>
                            <a
                                href={`/community?category=${post.group.id}&type=${post.group.type}`}
                                className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand/90 transition-colors"
                            >
                                Ir para a Comunidade
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>
                )}
            </article>

            {/* Comments Section */}
            <section className="border-t border-white/10 pt-10">
                <h3 className="text-2xl font-bold text-white mb-8">Comentários ({comments?.length || 0})</h3>

                {/* Comment List */}
                <div className="space-y-6 mb-10">
                    {comments?.map((comment: Comment) => {
                        const isCommentAuthor = user?.id === comment.author_id
                        const canDeleteComment = isCommentAuthor || isSuperAdmin || isModerator
                        return (
                            <div key={comment.id} className="flex gap-4 group">
                                <div className="h-8 w-8 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden">
                                    {comment.author?.avatar_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={comment.author.avatar_url} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs font-bold text-zinc-500">
                                            {comment.author?.full_name?.substring(0, 1) || '?'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div className="flex items-center">
                                                <BadgeRenderer badgeId={comment.author?.badge_left} groups={groups || []} />
                                                <span className={`font-semibold text-white text-sm px-1 ${comment.author && 'active_effect' in comment.author && comment.author.active_effect === 'shiny_nickname' ? 'shiny-text' : ''}`}>{comment.author?.full_name || 'User'}</span>
                                                <BadgeRenderer badgeId={comment.author?.badge_right} groups={groups || []} />
                                            </div>
                                            <span className="text-xs text-zinc-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {canDeleteComment && (
                                            <form action={deleteComment} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <input type="hidden" name="commentId" value={comment.id} />
                                                <input type="hidden" name="postId" value={post.id} />
                                                <button className="text-xs text-red-500 hover:text-red-400">
                                                    Excluir
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                    <p className="text-zinc-300 mt-1 text-sm">{comment.content}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Comment Form */}
                {user ? (
                    <form action={createComment} className="flex gap-4 items-start">
                        <input type="hidden" name="postId" value={post.id} />
                        <div className="h-8 w-8 rounded-full bg-brand flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">
                            You
                        </div>
                        <div className="flex-1">
                            <textarea
                                name="content"
                                required
                                placeholder="Escreva um comentário..."
                                rows={2}
                                className="w-full rounded-lg border-0 bg-zinc-900 p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-brand mb-2"
                            />
                            <SubmitButton className="text-sm font-semibold text-brand hover:text-brand/80 transition-colors">
                                Publicar Comentário
                            </SubmitButton>
                        </div>
                    </form>
                ) : (
                    <div className="rounded-lg bg-zinc-900/50 p-6 text-center">
                        <p className="text-zinc-400 mb-2">Faça login para participar da conversa</p>
                        <a href="/login" className="text-brand font-semibold hover:underline">Entrar</a>
                    </div>
                )}
            </section>
        </div>
    )
}
