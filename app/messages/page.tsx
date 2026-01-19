import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MessagesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Direct Messages
    const { data: messages } = await supabase
        .from('messages')
        .select(`
            *,
            sender:profiles!sender_id(full_name, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })

    // Fetch Announcements
    // 1. Fetch user's managed groups logic or followed groups? 
    // Usually Announcements are "Global" OR "From groups you are in"?
    // For now, let's fetch ALL Global Announcements + Announcements for groups related to recent posts? 
    // Or simpler: Fetch all Global Announcements.
    // And if we have concept of "Joined Groups" (we don't strictly, but we have badges/interactions).
    // Let's just fetch ALL Announcements for MVP (or filter by null target_group_id + maybe logic later).
    // Or show all public announcements.
    // However, schema has `target_group_id`.
    // Let's show Global Announcements + Group Announcements (we will fetch all and let filtering happen visually or just show all).
    // Better: Fetch Global (null) OR Group Agnostic.

    // Actually, `sendAnnouncement` allows targeted.
    // Let's just fetch everything for now for visibility, or refine.
    // We'll fetch Global (target_group_id is null).

    const { data: announcements } = await supabase
        .from('announcements')
        .select(`
            *,
            sender:profiles!sender_id(full_name),
            group:groups(name)
        `)
        .order('created_at', { ascending: false })


    return (
        <div className="mx-auto max-w-2xl py-8 px-4">
            <h1 className="text-2xl font-bold text-white mb-6">Mensagens</h1>

            <div className="space-y-8">
                {/* Announcements Section */}
                <section>
                    <h2 className="text-lg font-bold text-brand mb-4 flex items-center gap-2">
                        📢 Comunicados & Avisos
                    </h2>
                    <div className="space-y-4">
                        {!announcements || announcements.length === 0 ? (
                            <p className="text-zinc-500 text-sm">Nenhum comunicado.</p>
                        ) : (
                            announcements.map((ann) => (
                                <div key={ann.id} className="bg-brand/5 border border-brand/10 p-4 rounded-xl">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-brand text-sm">
                                                {ann.group ? `[${ann.group.name}]` : '[Geral]'}
                                            </span>
                                            <span className="text-xs text-zinc-400">
                                                {new Date(ann.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-zinc-200 text-sm">{ann.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Messages Section */}
                <section>
                    <h2 className="text-lg font-bold text-white mb-4">
                        Caixa de Entrada
                    </h2>
                    <div className="space-y-4">
                        {!messages || messages.length === 0 ? (
                            <div className="text-center py-10 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-700">
                                <p className="text-zinc-500 text-sm">Nenhuma mensagem recebida.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            {msg.sender?.avatar_url && <img src={msg.sender.avatar_url} alt="" className="h-full w-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium text-white text-sm">{msg.sender?.full_name || 'Desconhecido'}</span>
                                                <span className="text-xs text-zinc-500">
                                                    {new Date(msg.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-zinc-300 text-sm whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
