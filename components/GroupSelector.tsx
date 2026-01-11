'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Group {
    id: number
    name: string
    type: string
}

export default function GroupSelector({
    groups,
    type,
    activeCategoryId
}: {
    groups: Group[]
    type: 'idol' | 'actor'
    activeCategoryId: number | null
}) {
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Reset search when changing type? 
    // Usually component remounts if key changes, or we can useEffect.

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Search Bar */}
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder={`Buscar ${type === 'idol' ? 'ídolo' : 'ator'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white text-sm rounded-xl py-2.5 pl-10 pr-4 focus:ring-1 focus:ring-brand focus:border-brand transition-all placeholder:text-zinc-600"
                />
            </div>

            {/* Tags List */}
            <div className={`
                ${searchTerm ? 'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2' : 'flex gap-2 overflow-x-auto pb-2 scrollbar-hide'}
            `}>
                <Link
                    href={`/community?type=${type}`}
                    onClick={() => setSearchTerm('')}
                    className={`
                        rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all border
                        ${!activeCategoryId && !searchTerm
                            ? 'bg-brand text-white border-brand'
                            : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                        }
                        ${searchTerm ? 'hidden' : 'block'}
                    `}
                >
                    Todos
                </Link>

                {filteredGroups.map((group) => (
                    <Link
                        key={group.id}
                        href={`/community?type=${type}&category=${group.id}`}
                        onClick={() => setSearchTerm('')}
                        className={`
                            rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all border text-center
                            ${activeCategoryId === group.id
                                ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20'
                                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                            }
                        `}
                    >
                        {group.name}
                    </Link>
                ))}

                {filteredGroups.length === 0 && (
                    <div className="col-span-full py-4 text-center text-zinc-500 text-sm">
                        Nenhum resultado encontrado.
                    </div>
                )}
            </div>
        </div>
    )
}
