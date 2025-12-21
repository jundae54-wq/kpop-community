import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ADMIN_EMAIL = 'jundae54@gmail.com'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== ADMIN_EMAIL) {
        redirect('/')
    }

    // Fetch all profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="mx-auto max-w-5xl py-8 px-4">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-zinc-400 mb-8">Manage users and content</p>

            <div className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-zinc-400">
                        <tr>
                            <th className="p-4 font-medium">User</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Joined</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {profiles?.map((profile) => (
                            <tr key={profile.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-zinc-800 overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            {profile.avatar_url && <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />}
                                        </div>
                                        <span className="font-medium text-white">{profile.full_name || 'Anonymous'}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-zinc-300">
                                    {/* Matches profile id to auth id effectively, but we don't have email in profiles table usually. 
                                        Wait, existing schema doesn't store email in profiles? 
                                        Checking types/database.ts: Profile has id, username, full_name, avatar_url. 
                                        We might not be able to show email unless we join auth.users (not possible via client usually) 
                                        or if we stored it. 
                                        For now, we'll just show ID or Name.
                                    */}
                                    <span className="font-mono text-xs text-zinc-500">{profile.id}</span>
                                </td>
                                <td className="p-4 text-zinc-400">
                                    {/* Date */}
                                    -
                                </td>
                                <td className="p-4 text-right">
                                    <Link
                                        href={`/admin/user/${profile.id}`}
                                        className="inline-flex items-center justify-center rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10"
                                    >
                                        Manage
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
