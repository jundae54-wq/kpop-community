'use client'

import { useState } from 'react'
import ManagerApplicationModal from '@/app/community/application-modal'

export default function ApplyManagerButton({ groupId, groupName, hasPending }: { groupId: number, groupName: string, hasPending: boolean }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    if (hasPending) {
        return (
            <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg text-xs font-bold border border-yellow-500/20">
                Candidatura Pendente
            </span>
        )
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-zinc-700 hover:border-zinc-600"
            >
                Candidatar-se à Gerência
            </button>

            {isModalOpen && (
                <ManagerApplicationModal
                    groupId={groupId}
                    groupName={groupName}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    )
}
