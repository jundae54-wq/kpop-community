import { createAdminClient } from '@/utils/supabase/admin'
import Link from 'next/link'
import { adminDeleteComment } from '../admin-actions'
import { ConfirmDeleteButton } from '@/components/admin/ConfirmDeleteButton'
import AdminCommentList from './AdminCommentList'

export const dynamic = 'force-dynamic'

export default async function AdminCommentsPage() {
    const supabaseAdmin = createAdminClient()

    const { data: comments, error } = await supabaseAdmin
        .from('comments')
        .select('*, author:profiles(full_name), post:posts(title, group:groups(name))')
        .order('created_at', { ascending: false })
        .limit(100)

    if (error || !comments) {
        console.error('Failed to list comments:', error)
        return (
            <div className="p-8 text-center bg-zinc-900 rounded-xl border border-red-500/20">
                <h3 className="text-red-400 font-bold mb-2">Failed to load comments</h3>
                <p className="text-zinc-400 text-sm">{error?.message || 'No data available'}</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Recent Comments</h1>
            <AdminCommentList initialComments={comments} />
        </div>
    )
}
