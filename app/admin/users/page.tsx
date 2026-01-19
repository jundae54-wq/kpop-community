import { createAdminClient } from '@/utils/supabase/admin'
import Link from 'next/link'
import { banUser, deleteUser } from '../admin-actions'
import { ConfirmDeleteButton } from '@/components/admin/ConfirmDeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ filter?: string }>
}) {
    const supabaseAdmin = createAdminClient()
    const { filter } = await searchParams

    // Construct query
    // Supabase Auth API doesn't support complex filtering (like join with other tables) directly easily.
    // So we fetch profiles/moderators first if filtering, then filter the user list?
    // Or just fetch all users (limit 50-100) and filter in memory for MVP?
    // Since listUsers pagination is tricky without next_page_token, we'll assume <1000 users for now.

    // Fetch moderators first if needed
    let moderatorUserIds: Set<string> | null = null
    if (filter === 'managers') {
        const { data: mods } = await supabaseAdmin.from('group_moderators').select('user_id')
        if (mods) {
            moderatorUserIds = new Set(mods.map(m => m.user_id))
        }
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })

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

    // Fetch profiles to get nicknames
    const { data: profiles } = await supabaseAdmin.from('profiles').select('id, full_name, avatar_url')
    const profileMap = new Map(profiles?.map(p => [p.id, p]))

    // Fetch moderators
    // Fetch moderators (always need map for displaying, but also for filtering)
    const { data: moderators } = await supabaseAdmin.from('group_moderators').select('*')
    const moderatorMap = new Map()
    const allModeratorIds = new Set<string>()

    moderators?.forEach(m => {
        if (!moderatorMap.has(m.user_id)) moderatorMap.set(m.user_id, [])
        moderatorMap.get(m.user_id).push(m.group_id)
        allModeratorIds.add(m.user_id)
    })

    let displayedUsers = users
    if (filter === 'managers') {
        displayedUsers = users?.filter((u: any) => allModeratorIds.has(u.id)) || []
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">User Management</h1>
                <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg border border-white/10">
                    <Link
                        href="/admin/users"
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!filter ? 'bg-brand text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                    >
                        All Users
                    </Link>
                    <Link
                        href="/admin/users?filter=managers"
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === 'managers' ? 'bg-brand text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Managers Only
                    </Link>
                </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[800px]">
                    <thead className="bg-white/5 text-zinc-400">
                        <tr>
                            <th className="p-4 font-medium">User</th>
                            <th className="p-4 font-medium">Joined</th>
                            <th className="p-4 font-medium">Last Login</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {displayedUsers?.map((u) => {
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
                                    <td className="p-4 text-zinc-400">
                                        {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never'}
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

                                            <ConfirmDeleteButton
                                                action={deleteUser}
                                                itemId={u.id}
                                                itemType="user"
                                            />
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
