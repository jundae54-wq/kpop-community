import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { createComment, deletePost, deleteComment } from '@/app/auth/actions'
import { Post, Comment } from '@/types/database'
import { Metadata, ResolvingMetadata } from 'next'
import ViewTracker from '@/components/ViewTracker'

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

    // Fetch Post
    const { data: post } = await supabase
        .from('posts')
        .select(`*, author:profiles(*), group:groups(*)`)
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
        .select(`*, author:profiles(*)`)
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
                            <p className={`text-white font-medium ${post.author && 'active_effect' in post.author && post.author.active_effect === 'shiny_nickname' ? 'shiny-text' : ''}`}>{!post.group ? 'K-Community Bot' : (post.author?.full_name || 'Anônimo')}</p>
                            <p className="text-zinc-500 text-sm">Autor</p>
                        </div>
                    </div>
                </header>

                <div className="prose prose-invert prose-lg max-w-none text-zinc-300 whitespace-pre-wrap">
                    {post.content}
                </div>
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
                                        <div className="flex items-baseline gap-2">
                                            <span className={`font-semibold text-white text-sm ${comment.author && 'active_effect' in comment.author && comment.author.active_effect === 'shiny_nickname' ? 'shiny-text' : ''}`}>{comment.author?.full_name || 'User'}</span>
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
                            <button type="submit" className="text-sm font-semibold text-brand hover:text-brand/80 transition-colors">
                                Publicar Comentário
                            </button>
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
