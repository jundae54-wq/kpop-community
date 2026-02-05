import { createClient } from '@/utils/supabase/server'
import { reviewCategoryRequest } from './actions'
import { SubmitButton } from '@/components/SubmitButton'

export default async function AdminRequestsPage() {
    const supabase = await createClient()

    // Fetch pending requests
    const { data: requests } = await supabase
        .from('category_requests')
        .select(`
            *,
            user:profiles(full_name, avatar_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Solicitações de Novas Categorias</h1>

            <div className="space-y-4">
                {requests && requests.length > 0 ? (
                    requests.map((req: any) => (
                        <div key={req.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${req.type === 'idol' ? 'bg-brand/20 text-brand' : 'bg-blue-500/20 text-blue-500'}`}>
                                            {req.type}
                                        </span>
                                        <span className="text-zinc-500 text-xs">• {new Date(req.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">
                                        {req.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-zinc-500 text-sm">Solicitado por:</span>
                                        <div className="h-5 w-5 rounded-full bg-zinc-800 overflow-hidden">
                                            {req.user?.avatar_url && (
                                                <img src={req.user.avatar_url} className="h-full w-full object-cover" />
                                            )}
                                        </div>
                                        <span className="text-zinc-300 text-sm">{req.user?.full_name || 'Desconhecido'}</span>
                                    </div>
                                </div>
                                <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20">
                                    Pendente
                                </div>
                            </div>

                            {req.reason && (
                                <div className="bg-black/30 p-4 rounded-lg border border-zinc-800 mb-6">
                                    <p className="text-zinc-400 text-sm whitespace-pre-wrap">"{req.reason}"</p>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end">
                                <form action={async (formData) => {
                                    'use server'
                                    await reviewCategoryRequest(formData)
                                }}>
                                    <input type="hidden" name="requestId" value={req.id} />
                                    <input type="hidden" name="action" value="reject" />
                                    <SubmitButton
                                        className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
                                    >
                                        Rejeitar
                                    </SubmitButton>
                                </form>
                                <form action={async (formData) => {
                                    'use server'
                                    await reviewCategoryRequest(formData)
                                }}>
                                    <input type="hidden" name="requestId" value={req.id} />
                                    <input type="hidden" name="action" value="approve" />
                                    <SubmitButton
                                        className="px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand/90 text-sm font-bold shadow-lg shadow-brand/20 transition-colors"
                                    >
                                        Aprovar & Criar Categoria
                                    </SubmitButton>
                                </form>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
                        <p className="text-zinc-500">Nenhuma solicitação pendente.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
