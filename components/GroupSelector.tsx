'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import RequestCategoryModal from '@/app/community/request-category-modal'

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
    const [search, setSearch] = useState('')
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
    const router = useRouter()

    // Filter groups independently
    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Search Bar */}
            <div className="relative mb-4 flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder={`Buscar ${type === 'idol' ? 'ídolo' : 'ator'}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white text-sm rounded-xl py-2.5 pl-10 pr-4 focus:ring-1 focus:ring-brand focus:border-brand transition-all placeholder:text-zinc-600"
                    />
                </div>
                <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="whitespace-nowrap bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-zinc-700"
                >
                    + Solicitar Novo
                </button>
            </div>

            {/* Tags List */}
            <div className={`
                ${search ? 'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2' : 'flex gap-2 overflow-x-auto pb-2 scrollbar-hide'}
            `}>
                <Link
                    href={`/community?type=${type}`}
                    onClick={() => setSearch('')}
                    className={`
                        rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all border
                        ${!activeCategoryId && !search
                            ? 'bg-brand text-white border-brand'
                            : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                        }
                        ${search ? 'hidden' : 'block'}
                    `}
                >
                    Todos
                </Link>

                {filteredGroups.map((group) => (
                    <Link
                        key={group.id}
                        href={`/community?type=${type}&category=${group.id}`}
                        onClick={() => setSearch('')}
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
                    <div className="col-span-full py-8 text-center bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                        <p className="text-zinc-500 text-sm mb-2">Nenhum resultado encontrado.</p>
                        <button
                            onClick={() => setIsRequestModalOpen(true)}
                            className="text-brand text-sm hover:underline font-bold"
                        >
                            Solicitar criação de "{search}"
                        </button>
                    </div>
                )}
            </div>

            <RequestCategoryModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                type={type}
            />
        </div>
    )
}
