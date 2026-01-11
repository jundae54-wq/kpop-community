'use client'

import { useState } from 'react'

type Props = {
    currentPoints: number
    ownedItems: Set<string>
    buyItemAction: (formData: FormData) => Promise<void>
}

// Consumable solid colors
const SOLID_COLORS = [
    { id: 'nick-red', name: 'Vermelho', color: 'bg-red-500' },
    { id: 'nick-blue', name: 'Azul', color: 'bg-blue-500' },
    { id: 'nick-green', name: 'Verde', color: 'bg-green-500' },
    { id: 'nick-pink', name: 'Rosa', color: 'bg-pink-500' },
    { id: 'nick-purple', name: 'Roxo', color: 'bg-purple-500' },
    { id: 'nick-gold', name: 'Dourado', color: 'bg-yellow-500' },
]

// Permanent shiny effects
const SHINY_EFFECTS = [
    { id: 'shiny_nickname', name: 'Original', class: 'shiny-text', colors: 'from-amber-300 to-purple-400' },
    { id: 'shiny-gold', name: 'Gold', class: 'shiny-gold', colors: 'from-yellow-300 to-amber-600' },
    { id: 'shiny-ocean', name: 'Ocean', class: 'shiny-ocean', colors: 'from-cyan-300 to-blue-600' },
    { id: 'shiny-sunset', name: 'Sunset', class: 'shiny-sunset', colors: 'from-rose-300 to-pink-600' },
    { id: 'shiny-emerald', name: 'Emerald', class: 'shiny-emerald', colors: 'from-emerald-300 to-green-600' },
    { id: 'shiny-berry', name: 'Berry', class: 'shiny-berry', colors: 'from-purple-300 to-violet-600' },
]

export default function ShopItemSelector({ currentPoints, ownedItems, buyItemAction }: Props) {
    const [selectedColor, setSelectedColor] = useState(SOLID_COLORS[0])
    const [selectedShiny, setSelectedShiny] = useState(SHINY_EFFECTS[0])
    const [loading, setLoading] = useState(false)

    // Helper to wrap action with loading state
    const handlePurchase = async (formData: FormData) => {
        setLoading(true)
        await buyItemAction(formData) // This will redirect, so loading state stays true until nav
    }

    const isShinyOwned = ownedItems.has(selectedShiny.id)

    return (
        <div className="grid gap-8 md:grid-cols-2 mb-12">
            {/* 1. Solid Colors (Consumable) */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-white">Cor do Nick</h2>
                    <p className="text-zinc-400 text-sm">Consumível • Pagamento a cada troca</p>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center py-8">
                    {/* Preview */}
                    <div className="text-2xl font-bold mb-8">
                        <span className="text-zinc-500 mr-2">Preview:</span>
                        <span className={selectedColor.id}>{selectedColor.name} User</span>
                    </div>

                    {/* Selector */}
                    <div className="w-full max-w-xs grid grid-cols-6 gap-2 mb-8">
                        {SOLID_COLORS.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedColor(c)}
                                className={`h-10 w-10 rounded-full border-2 transition-transform hover:scale-110 ${c.color} ${selectedColor.id === c.id ? 'border-white scale-110 ring-2 ring-white/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                aria-label={c.name}
                            />
                        ))}
                    </div>

                    <div className="text-sm font-medium text-white bg-zinc-800 px-3 py-1 rounded-full mb-6">
                        {selectedColor.name}
                    </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                    <div className="text-lg font-bold text-white">100 pts</div>
                    <form action={handlePurchase}>
                        <input type="hidden" name="itemType" value={selectedColor.id} />
                        <button
                            disabled={loading || currentPoints < 100}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${currentPoints >= 100
                                ? 'bg-white text-black hover:bg-zinc-200'
                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                }`}
                        >
                            {loading ? 'Processando...' : 'Comprar Cor'}
                        </button>
                    </form>
                </div>
            </div>

            {/* 2. Shiny Effects (Permanent) */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col relative overflow-hidden group">
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${selectedShiny.colors} opacity-10 blur-[100px] pointer-events-none transition-colors duration-500`} />

                <div className="mb-4 relative z-10">
                    <h2 className="text-xl font-bold text-white">Shiny Effect</h2>
                    <p className="text-zinc-400 text-sm">Permanente • Desbloqueie variantes</p>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center py-8 relative z-10">
                    {/* Preview */}
                    <div className="text-3xl font-bold mb-8 transition-all duration-300">
                        <span className={selectedShiny.class}>Any Name Here</span>
                    </div>

                    {/* Selector */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-sm">
                        {SHINY_EFFECTS.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedShiny(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedShiny.id === s.id
                                    ? 'bg-white text-black border-white'
                                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                                    }`}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex items-center justify-between relative z-10">
                    <div className="text-lg font-bold text-white">
                        {isShinyOwned ? <span className="text-brand">Adquirido</span> : '100 pts'}
                    </div>

                    <form action={handlePurchase}>
                        <input type="hidden" name="itemType" value={selectedShiny.id} />
                        {isShinyOwned ? (
                            <button
                                disabled
                                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            >
                                Já Possui
                            </button>
                        ) : (
                            <button
                                disabled={loading || currentPoints < 100}
                                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${currentPoints >= 100
                                    ? 'bg-brand text-white hover:bg-brand/90 shadow-[0_0_20px_-5px_var(--color-brand)]'
                                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    }`}
                            >
                                {loading ? 'Processando...' : 'Desbloquear'}
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
