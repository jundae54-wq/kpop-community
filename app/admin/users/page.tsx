import { createAdminClient } from '@/utils/supabase/admin'
import Link from 'next/link'
import { banUser, deleteUser } from '../admin-actions'

export default async function AdminUsersPage() {
    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error || !data) {
        console.error('Failed to list users:', error)
        return (
            <div className="p-8 text-center bg-zinc-900 rounded-xl border border-red-500/20">
                <h3 className="text-red-400 font-bold mb-2">Failed to load users</h3>
                <p className="text-zinc-400 text-sm mb-4">
                    This usually means the Service Role Key is missing or invalid.
                </p>
                <code className="block bg-black/30 p-2 rounded text-xs text-red-300 overflow-x-auto">
                    {error?.message || 'No data returned'}
                </code>
            </div>
        )
    }

    const { users } = data
    const profileMap = new Map(profiles?.map(p => [p.id, p]))

    // Fetch moderators
    const { data: moderators } = await supabaseAdmin.from('group_moderators').select('*')
    const moderatorMap = new Map()
    moderators?.forEach(m => {
        if (!moderatorMap.has(m.user_id)) moderatorMap.set(m.user_id, [])
        moderatorMap.get(m.user_id).push(m.group_id)
    })

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>
            <div className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-zinc-400">
                        <tr>
                            <th className="p-4 font-medium">User</th>
                            <th className="p-4 font-medium">Joined</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users?.map((u) => {
                            const profile = profileMap.get(u.id)
                            const isBanned = u.ban_duration && u.ban_duration !== 'none' && u.ban_duration !== '0'

                            return (
                                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                {profile?.avatar_url && <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{profile?.full_name || 'No Name'}</div>
                                                <div className="text-zinc-500 text-xs">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-zinc-400">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        {isBanned ? (
                                            <span className="inline-flex items-center rounded-full bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-400/20">
                                                Banned
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-400/20">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            <Link
                                                href={`/admin/user/${u.id}`}
                                                className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-white/5 hover:bg-white/10 rounded transition-colors"
                                            >
                                                Details
                                            </Link>

                                            <form action={banUser}>
                                                <input type="hidden" name="userId" value={u.id} />
                                                <input type="hidden" name="banDuration" value={isBanned ? 'none' : 'permanent'} />
                                                <button className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${isBanned
                                                    ? 'text-zinc-300 bg-white/5 hover:bg-white/10'
                                                    : 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                                                    }`}>
                                                    {isBanned ? 'Unban' : 'Ban'}
                                                </button>
                                            </form>

                                            <form action={deleteUser} onSubmit={(e) => !confirm('Delete user? This cannot be undone.') && e.preventDefault()}>
                                                <input type="hidden" name="userId" value={u.id} />
                                                <button className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded transition-colors">
                                                    Delete
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
