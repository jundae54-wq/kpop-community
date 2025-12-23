import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { createComment } from '@/app/auth/actions'
import { Post, Comment } from '@/types/database'
import { Metadata, ResolvingMetadata } from 'next'
import ViewTracker from '@/components/ViewTracker'

type Props = {
    params: { id: string }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = (await params).id
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

export default async function PostPage({ params }: Props) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { id } = await params

    // Fetch Post
    const { data: post } = await supabase
        .from('posts')
        .select(`*, author:profiles(*), group:groups(*)`)
        .eq('id', id)
        .single()

    if (!post) {
        notFound()
    }

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
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        {post.group && <span className="text-brand font-medium">#{post.group.name}</span>}
                        {!post.group && <span className="text-brand font-medium">📰 Notícia</span>}
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
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
                            <p className="text-white font-medium">{!post.group ? 'K-Community Bot' : (post.author?.full_name || 'Anônimo')}</p>
                            <p className="text-zinc-500 text-sm">Autor</p>
                        </div>
                    </div>
                </header>

                <div className="prose prose-invert prose-lg max-w-none text-zinc-300 whitespace-pre-wrap">
                    {post.content}
                </div>

                {/* Image hidden for copyright safety */}
                {/* {post.image_url && (
                    <div className="mt-8 rounded-xl overflow-hidden">
                        <img src={post.image_url} alt="" className="w-full object-cover" />
                    </div>
                )} */}
            </article>

            {/* Comments Section */}
            <section className="border-t border-white/10 pt-10">
                <h3 className="text-2xl font-bold text-white mb-8">Comentários ({comments?.length || 0})</h3>

                {/* Comment List */}
                <div className="space-y-6 mb-10">
                    {comments?.map((comment: Comment) => (
                        <div key={comment.id} className="flex gap-4">
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
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-semibold text-white text-sm">{comment.author?.full_name || 'User'}</span>
                                    <span className="text-xs text-zinc-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-zinc-300 mt-1 text-sm">{comment.content}</p>
                            </div>
                        </div>
                    ))}
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
