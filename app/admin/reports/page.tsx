import { createAdminClient } from '@/utils/supabase/server'
import { resolveReport } from '@/app/actions/reporting'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminReportsPage() {
    // We use regular client to get current user ID for filtering 'my group' (if needed)
    // But Admin Page usually implies full admin unless restricted.
    // User requested: "That category's manager can also see".
    // So we need to fetch user, check their groups, and filter reports where target's group matches.
    // However, reports target 'post' or 'comment'. We need to join to find the group.

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Unauthorized</div>

    const userEmail = user.email
    const isSuperAdmin = userEmail === 'jundae54@gmail.com'

    // Fetch User's Managed Groups
    const { data: managedGroups } = await supabase
        .from('group_moderators')
        .select('group_id')
        .eq('user_id', user.id)

    const managedGroupIds = new Set(managedGroups?.map(g => g.group_id))

    // Fetch Pending Reports
    const supabaseAdmin = createAdminClient()
    const { data: reports } = await supabaseAdmin
        .from('reports')
        .select(`
            *,
            reporter:profiles!reporter_id(full_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    // We need to fetch the content to know which group it belongs to.
    // Doing this in code for MVP to avoid complex SQL View.
    // Ideally we create a view `reports_with_context`.

    // For now, let's fetch all posts/comments referenced in reports??
    // That's N+1 query.
    // Better: Fetch all target IDs.

    // 1. Separate by type
    const postIds = reports?.filter(r => r.target_type === 'post').map(r => r.target_id) || []
    const commentIds = reports?.filter(r => r.target_type === 'comment').map(r => r.target_id) || []

    // 2. Fetch Posts (to check group_id)
    let postMap = new Map<number, any>()
    if (postIds.length > 0) {
        const { data: posts } = await supabaseAdmin.from('posts').select('id, title, content, group_id').in('id', postIds)
        posts?.forEach(p => postMap.set(p.id, p))
    }

    // 3. Fetch Comments (to check post -> group_id)
    // We need comment -> post -> group_id
    let commentMap = new Map<number, any>()
    let commentPostIds = new Set<number>()

    if (commentIds.length > 0) {
        const { data: comments } = await supabaseAdmin.from('comments').select('id, content, post_id').in('id', commentIds)
        comments?.forEach(c => {
            commentMap.set(c.id, c)
            commentPostIds.add(c.post_id)
        })
    }

    // Fetch posts for comments to get group_id (if not already fetched)
    const extraPostIds = Array.from(commentPostIds).filter(id => !postMap.has(id))
    if (extraPostIds.length > 0) {
        const { data: posts } = await supabaseAdmin.from('posts').select('id, title, group_id').in('id', extraPostIds)
        posts?.forEach(p => postMap.set(p.id, p))
    }

    // Filter Reports
    const filteredReports = reports?.filter(r => {
        if (isSuperAdmin) return true

        let groupId = null
        if (r.target_type === 'post') {
            groupId = postMap.get(r.target_id)?.group_id
        } else {
            const comment = commentMap.get(r.target_id)
            if (comment) {
                const post = postMap.get(comment.post_id)
                groupId = post?.group_id
            }
        }

        // If no group (e.g. news), only Super Admin sees? Or if groupId is null?
        if (!groupId) return false // Generic content, only admin

        return managedGroupIds.has(groupId)
    }) || []

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Denúncias (Moderation)</h1>

            <div className="space-y-4">
                {filteredReports.length === 0 ? (
                    <div className="text-zinc-500">Nenhuma denúncia pendente.</div>
                ) : (
                    filteredReports.map((report) => {
                        let contentPreview = ''
                        let context = ''

                        if (report.target_type === 'post') {
                            const post = postMap.get(report.target_id)
                            contentPreview = post?.content || post?.title || '[Post Deleted]'
                            context = 'Post'
                        } else {
                            const comment = commentMap.get(report.target_id)
                            contentPreview = comment?.content || '[Comment Deleted]'
                            context = 'Comment'
                        }

                        return (
                            <div key={report.id} className="bg-zinc-900 border border-white/10 p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2 py-1 rounded uppercase mr-2">
                                            {report.reason}
                                        </span>
                                        <span className="text-zinc-400 text-sm">
                                            por {report.reporter?.full_name || report.reporter?.email || 'Anônimo'}
                                        </span>
                                    </div>
                                    <div className="text-zinc-500 text-xs">
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="bg-black/30 p-3 rounded-lg mb-4 text-zinc-300 text-sm border-l-2 border-brand">
                                    <div className="text-xs text-zinc-500 mb-1 font-bold uppercase">{context} (ID: {report.target_id})</div>
                                    {contentPreview.substring(0, 200)}...
                                </div>

                                <div className="flex justify-end gap-2">
                                    <ReportActionForm reportId={report.id} action="dismiss" label="Ignorar" />
                                    <ReportActionForm reportId={report.id} action="hide" label="Ocultar" targetType={report.target_type} targetId={report.target_id} />
                                    <ReportActionForm reportId={report.id} action="delete" label="Excluir" targetType={report.target_type} targetId={report.target_id} isDestructive />
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

function ReportActionForm({ reportId, action, label, targetType, targetId, isDestructive = false }: any) {
    return (
        <form action={async () => {
            'use server'
            await resolveReport(reportId, action, targetType, targetId)
        }}>
            <button
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${isDestructive
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : action === 'hide'
                            ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }`}
            >
                {label}
            </button>
        </form>
    )
}
