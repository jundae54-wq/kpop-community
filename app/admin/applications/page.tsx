import { createClient } from '@/utils/supabase/server'
import { reviewApplication } from './actions'
import Link from 'next/link'
import { SubmitButton } from '@/components/SubmitButton'

export const dynamic = 'force-dynamic'

export default async function AdminApplicationsPage() {
    const supabase = await createClient()

    // Fetch pending applications with user and group details
    const { data: applications } = await supabase
        .from('manager_applications')
        .select(`
            *,
            user:profiles(*),
            group:groups(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Solicitações de Gerência</h1>

            <div className="space-y-4">
                {applications && applications.length > 0 ? (
                    applications.map((app: any) => (
                        <div key={app.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        {app.group?.name}
                                        <span className="text-zinc-500 text-sm font-normal">
                                            (ID: {app.group?.id})
                                        </span>
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-6 w-6 rounded-full bg-zinc-800 overflow-hidden">
                                            {app.user?.avatar_url && (
                                                <img src={app.user.avatar_url} className="h-full w-full object-cover" />
                                            )}
                                        </div>
                                        <span className="text-zinc-300 text-sm">{app.user?.full_name}</span>
                                        <span className="text-zinc-600 text-xs">• {new Date(app.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20">
                                    Pendente
                                </div>
                            </div>

                            <div className="bg-black/30 p-4 rounded-lg border border-zinc-800 mb-6">
                                <p className="text-zinc-400 text-sm whitespace-pre-wrap">"{app.reason}"</p>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <form action={async (formData) => {
                                    'use server'
                                    await reviewApplication(formData)
                                }}>
                                    <input type="hidden" name="applicationId" value={app.id} />
                                    <input type="hidden" name="action" value="reject" />
                                    <SubmitButton
                                        className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
                                    >
                                        Rejeitar
                                    </SubmitButton>
                                </form>
                                <form action={async (formData) => {
                                    'use server'
                                    await reviewApplication(formData)
                                }}>
                                    <input type="hidden" name="applicationId" value={app.id} />
                                    <input type="hidden" name="action" value="approve" />
                                    <SubmitButton
                                        className="px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand/90 text-sm font-bold shadow-lg shadow-brand/20 transition-colors"
                                    >
                                        Aprovar & Tornar Gerente
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

            <div className="mt-12 pt-8 border-t border-zinc-800">
                <Link href="/admin/groups" className="text-brand hover:underline">
                    Ver Todos os Grupos e Gerentes →
                </Link>
            </div>
        </div>
    )
}
