import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { buyItem } from './actions'

export const dynamic = 'force-dynamic'

export default async function ShopPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const currentPoints = profile?.points || 0
    const activeEffect = profile?.active_effect

    const { success, error } = await searchParams

    return (
        <div className="mx-auto max-w-4xl py-8 px-4">
            <h1 className="text-2xl font-bold text-white mb-6">Point Shop</h1>

            {/* User Balance Card */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-zinc-400 text-sm font-medium mb-1">Your Balance</h2>
                    <div className="text-4xl font-bold text-brand">{currentPoints.toLocaleString()} <span className="text-lg text-zinc-500">pts</span></div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-zinc-500">Current Effect</div>
                    <div className="text-white font-medium">
                        {activeEffect === 'shiny_nickname' ? (
                            <span className="shiny-text">Shiny Nickname</span>
                        ) : 'None'}
                    </div>
                </div>
            </div>

            {success && (
                <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm">
                    {success}
                </div>
            )}

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <h2 className="text-lg font-bold text-white mb-4">Items for Sale</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Shiny Nickname Item */}
                <div className="group relative bg-zinc-900 border border-white/5 rounded-2xl p-6 hover:border-brand/50 transition-colors">
                    <div className="absolute top-4 right-4 bg-zinc-800 text-xs font-mono text-zinc-400 px-2 py-1 rounded">
                        Permanent
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-300 to-purple-400 mb-4 animate-pulse opacity-80 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-lg font-bold text-white mb-1">Shiny Nickname</h3>
                    <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                        Make your nickname sparkle in every post and comment! Stand out from the crowd.
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                        <div className="text-brand font-bold">100 pts</div>
                        <form action={buyItem}>
                            <input type="hidden" name="itemType" value="shiny_nickname" />
                            {activeEffect === 'shiny_nickname' ? (
                                <button disabled className="px-4 py-2 rounded-lg bg-white/5 text-zinc-500 text-sm font-medium cursor-not-allowed">
                                    Equipped
                                </button>
                            ) : (
                                <button
                                    disabled={currentPoints < 100}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPoints >= 100
                                            ? 'bg-brand hover:bg-brand/90 text-white shadow-[0_0_15px_-3px_rgba(255,45,149,0.4)]'
                                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                        }`}
                                >
                                    {currentPoints >= 100 ? 'Buy' : 'Not Enough Points'}
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* Placeholder for future items */}
                <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 opacity-50 flex flex-col items-center justify-center text-center min-h-[200px]">
                    <div className="text-2xl mb-2">🔒</div>
                    <h3 className="text-zinc-500 font-medium">Coming Soon</h3>
                    <p className="text-xs text-zinc-600 mt-1">More effects and badges on the way!</p>
                </div>
            </div>
        </div>
    )
}
