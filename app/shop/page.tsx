import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { buyItem, equipBadge, equipEffect } from './actions'

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
    const badgeLeft = profile?.badge_left
    const badgeRight = profile?.badge_right

    // Fetch groups for dynamic badges
    const { data: groups } = await supabase.from('groups').select('*').order('name')

    // Fetch inventory
    const { data: inventory } = await supabase.from('user_inventory').select('*').eq('user_id', user.id)

    const params = await searchParams
    const tab = params.tab || 'store' // 'store' or 'inventory'
    const success = params.success
    const error = params.error

    const ownedItemIds = new Set(inventory?.map(i => i.item_id))

    return (
        <div className="mx-auto max-w-5xl py-8 px-4">
            <h1 className="text-2xl font-bold text-white mb-6">Loja de Pontos</h1>

            {/* User Balance Card */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-zinc-400 text-sm font-medium mb-1">Seus Pontos</h2>
                    <div className="text-4xl font-bold text-brand">{currentPoints.toLocaleString()} <span className="text-lg text-zinc-500">pts</span></div>
                </div>
                <div className="flex gap-8 text-right">
                    <div>
                        <div className="text-sm text-zinc-500">Efeito</div>
                        <div className="text-white font-medium">
                            {activeEffect ? (
                                <span className={activeEffect === 'shiny_nickname' ? 'shiny-text' : activeEffect}>{activeEffect.replace('nick-', '').replace('shiny_nickname', 'Shiny')}</span>
                            ) : '-'}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-zinc-500">Emblemas</div>
                        <div className="text-white font-medium flex gap-2 justify-end">
                            {badgeLeft ? <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs">{badgeLeft.replace('badge_', 'ID:')}</span> : <span className="text-zinc-600">-</span>}
                            {badgeRight ? <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs">{badgeRight.replace('badge_', 'ID:')}</span> : <span className="text-zinc-600">-</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-6">
                <Link
                    href="/shop?tab=store"
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${tab === 'store' ? 'border-brand text-white' : 'border-transparent text-zinc-400 hover:text-white'}`}
                >
                    Loja
                </Link>
                <Link
                    href="/shop?tab=inventory"
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${tab === 'inventory' ? 'border-brand text-white' : 'border-transparent text-zinc-400 hover:text-white'}`}
                >
                    Inventário
                </Link>
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

            {tab === 'store' ? (
                <div className="space-y-8">
                    {/* Special Items */}
                    {/* Special Items */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-4">Cores de Nick (Pagamento Único / Consumível)</h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                            {/* Consumable Colors */}
                            {[
                                { id: 'nick-red', name: 'Vermelho', price: 30, color: 'bg-red-500' },
                                { id: 'nick-blue', name: 'Azul', price: 30, color: 'bg-blue-500' },
                                { id: 'nick-green', name: 'Verde', price: 30, color: 'bg-green-500' },
                                { id: 'nick-pink', name: 'Rosa', price: 30, color: 'bg-pink-500' },
                                { id: 'nick-purple', name: 'Roxo', price: 30, color: 'bg-purple-500' },
                                { id: 'nick-gold', name: 'Dourado', price: 100, color: 'bg-yellow-500' },
                            ].map((item) => (
                                <div key={item.id} className="relative bg-zinc-900 border border-white/5 rounded-2xl p-6 hover:border-brand/50 transition-colors">
                                    <div className={`h-12 w-12 rounded-lg ${item.color} mb-4 opacity-80`} />
                                    <h3 className={`text-lg font-bold text-white mb-1 ${item.id}`}>User</h3>
                                    <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                                        Muda a cor do seu nome para {item.name}. (Gasta pontos a cada troca)
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="text-white font-bold text-sm">{item.price} pts</div>
                                        <form action={buyItem}>
                                            <input type="hidden" name="itemType" value={item.id} />
                                            <button
                                                disabled={currentPoints < item.price}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentPoints >= item.price
                                                    ? 'bg-zinc-800 hover:bg-brand text-white border border-white/10'
                                                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                                    }`}
                                            >
                                                Comprar
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-lg font-bold text-white mb-4">Especiais (Permanentes)</h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                            <div className="group relative bg-zinc-900 border border-white/5 rounded-2xl p-6 hover:border-brand/50 transition-colors">
                                <div className="absolute top-4 right-4 bg-zinc-800 text-xs font-mono text-zinc-400 px-2 py-1 rounded">
                                    Permanente
                                </div>
                                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-300 to-purple-400 mb-4 animate-pulse opacity-80 group-hover:opacity-100 transition-opacity" />
                                <h3 className="text-lg font-bold text-white mb-1 shiny-text">Shiny Nickname</h3>
                                <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                                    Efeito brilhante desbloqueado para sempre no inventário.
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="text-brand font-bold">100 pts</div>
                                    <form action={buyItem}>
                                        <input type="hidden" name="itemType" value="shiny_nickname" />
                                        {ownedItemIds.has('shiny_nickname') ? (
                                            <button disabled className="px-4 py-2 rounded-lg bg-white/5 text-zinc-500 text-sm font-medium cursor-not-allowed">
                                                Adquirido
                                            </button>
                                        ) : (
                                            <button
                                                disabled={currentPoints < 100}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPoints >= 100
                                                    ? 'bg-brand hover:bg-brand/90 text-white shadow-[0_0_15px_-3px_rgba(255,45,149,0.4)]'
                                                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                                    }`}
                                            >
                                                Comprar
                                            </button>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Badge Items */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-4">Emblemas de Fandom</h2>
                        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {groups?.map(group => {
                                const itemId = `badge_${group.id}`
                                const isOwned = ownedItemIds.has(itemId)
                                return (
                                    <div key={group.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 hover:bg-zinc-900 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 border border-white/5">
                                                {group.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{group.name}</div>
                                                <div className="text-xs text-zinc-500 capitalize">{group.type}</div>
                                                <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                                                    Requer 1 post e 1 comentário nesta comunidade
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="text-zinc-400 text-xs font-bold">50 pts</div>
                                            <form action={buyItem}>
                                                <input type="hidden" name="itemType" value={itemId} />
                                                {isOwned ? (
                                                    <button disabled className="px-3 py-1.5 rounded bg-white/5 text-zinc-500 text-xs font-medium cursor-not-allowed">
                                                        Possui
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled={currentPoints < 50}
                                                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${currentPoints >= 50
                                                            ? 'bg-zinc-800 hover:bg-brand hover:text-white text-zinc-300'
                                                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        Comprar
                                                    </button>
                                                )}
                                            </form>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Inventory Tab */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-4">Seus Itens</h2>
                        <div className="space-y-4">
                            {/* Effects Section */}
                            <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                                <h3 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">Efeitos Especiais</h3>
                                <div className="flex flex-wrap gap-4">
                                    {ownedItemIds.has('shiny_nickname') && (
                                        <div className="flex items-center justify-between gap-4 bg-zinc-950 p-3 rounded-lg border border-white/5 w-full sm:w-auto">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded bg-gradient-to-br from-amber-300 to-purple-400 animate-pulse" />
                                                <span className="font-medium text-white">Shiny Nickname</span>
                                            </div>
                                            <form action={equipEffect}>
                                                <input type="hidden" name="itemId" value={activeEffect === 'shiny_nickname' ? 'none' : 'shiny_nickname'} />
                                                <button className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${activeEffect === 'shiny_nickname' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-brand text-white hover:bg-brand/90'}`}>
                                                    {activeEffect === 'shiny_nickname' ? 'Desativar' : 'Ativar'}
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                    {!ownedItemIds.has('shiny_nickname') && <p className="text-zinc-500 text-sm">Você não possui efeitos.</p>}
                                </div>
                            </div>

                            {/* Badges Section */}
                            <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                                <h3 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">Emblemas (Badges)</h3>
                                <p className="text-zinc-500 text-xs mb-4">Equipe emblemas à esquerda ou direita do seu nickname.</p>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {inventory?.filter(i => i.item_type === 'badge').map(item => {
                                        // Find group name
                                        const groupId = parseInt(item.item_id.split('_')[1])
                                        const group = groups?.find(g => g.id === groupId)
                                        const badgeName = group ? group.name : 'Unknown Badge'

                                        const isEquippedLeft = badgeLeft === item.item_id
                                        const isEquippedRight = badgeRight === item.item_id

                                        return (
                                            <div key={item.id} className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                                                        {badgeName.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-white text-sm">{badgeName}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <form action={equipBadge}>
                                                        <input type="hidden" name="itemId" value={item.item_id} />
                                                        <input type="hidden" name="slot" value="left" />
                                                        <input type="hidden" name="action" value={isEquippedLeft ? 'unequip' : 'equip'} />
                                                        <button
                                                            disabled={isEquippedRight} // Can't equip same to both slots? Actually logic allows it but let's allow it.
                                                            className={`w-full px-2 py-1 text-[10px] font-bold rounded border transition-colors ${isEquippedLeft
                                                                ? 'bg-brand text-white border-brand'
                                                                : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                                                                }`}
                                                        >
                                                            {isEquippedLeft ? 'L: Equipado' : 'Equipar Esq.'}
                                                        </button>
                                                    </form>
                                                    <form action={equipBadge}>
                                                        <input type="hidden" name="itemId" value={item.item_id} />
                                                        <input type="hidden" name="slot" value="right" />
                                                        <input type="hidden" name="action" value={isEquippedRight ? 'unequip' : 'equip'} />
                                                        <button
                                                            className={`w-full px-2 py-1 text-[10px] font-bold rounded border transition-colors ${isEquippedRight
                                                                ? 'bg-brand text-white border-brand'
                                                                : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                                                                }`}
                                                        >
                                                            {isEquippedRight ? 'R: Equipado' : 'Equipar Dir.'}
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {(!inventory || inventory.filter(i => i.item_type === 'badge').length === 0) && (
                                        <p className="text-zinc-500 text-sm">Nenhum emblema adquirido.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
}
