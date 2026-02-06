import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { removeManager, deleteGroup } from './actions'
import { SubmitButton } from '@/components/SubmitButton'

export const dynamic = 'force-dynamic'

export default async function AdminGroupsPage() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.email !== 'jundae54@gmail.com') {
        redirect('/')
    }

    // Use Admin Client to fetch all groups + managers, bypassing RLS
    const adminSupabase = createAdminClient()

    // Fetch all groups with their managers
    const { data: groups, error } = await adminSupabase
        .from('groups')
        .select(`
            id,
            name,
            type,
            group_moderators(
                user:profiles(
                    id,
                    full_name,
                    avatar_url
                )
            )
        `)
        .order('name')

    if (error) {
        console.error('Groups Fetch Error:', error)
        return <div className="p-6 text-red-500">Erro ao carregar grupos: {error.message}</div>
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Gerenciamento de Grupos</h1>

            <div className="grid gap-4">
                {groups && groups.map((group: any) => {
                    const manager = group.group_moderators?.[0]?.user

                    return (
                        <div key={group.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 text-xl flex items-center justify-center rounded-lg ${group.type === 'idol' ? 'bg-brand/10 text-brand' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {group.type === 'idol' ? '🎤' : '🎬'}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{group.name}</h3>
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">{group.type}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {manager ? (
                                    <div className="flex items-center gap-3 bg-zinc-800/50 pr-4 pl-3 py-1.5 rounded-full border border-zinc-700">
                                        <div className="h-6 w-6 rounded-full bg-zinc-700 overflow-hidden">
                                            {manager.avatar_url && <img src={manager.avatar_url} className="h-full w-full object-cover" />}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-white font-medium line-clamp-1">{manager.full_name}</p>
                                            <p className="text-[10px] text-zinc-500">Gerente</p>
                                        </div>
                                        <form action={async (formData) => {
                                            'use server'
                                            await removeManager(formData)
                                        }}>
                                            <input type="hidden" name="groupId" value={group.id} />
                                            <input type="hidden" name="userId" value={manager.id} />
                                            <SubmitButton className="ml-2 p-1 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </SubmitButton>
                                        </form>
                                    </div>
                                ) : (
                                    <span className="text-zinc-600 text-sm font-medium italic px-3">
                                        Vago (Admin Global)
                                    </span>
                                )}

                                <div className="h-8 w-px bg-zinc-800 mx-2"></div>

                                <form action={async (formData) => {
                                    'use server'
                                    await deleteGroup(formData)
                                }}>
                                    <input type="hidden" name="groupId" value={group.id} />
                                    <SubmitButton className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors group">
                                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </SubmitButton>
                                </form>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
