import { createClient } from '@/utils/supabase/server'
import { BadgeRenderer } from '@/components/BadgeRenderer'

export default async function AdminGroupsPage() {
    const supabase = await createClient()

    // Fetch all groups with their managers
    const { data: groups } = await supabase
        .from('groups')
        .select(`
            id,
            name,
            type,
            group_moderators(
                user:profiles(
                    id,
                    full_name,
                    username,
                    avatar_url
                )
            )
        `)
        .order('name')

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
                                    </div>
                                ) : (
                                    <span className="text-zinc-600 text-sm font-medium italic px-3">
                                        Vago (Admin Global)
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
