'use client'

import { useState } from 'react'
import { applyForManager } from '@/app/actions/manager'

export default function ManagerApplicationModal({ groupId, groupName, onClose }: { groupId: number, groupName: string, onClose: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        const result = await applyForManager(formData)
        setIsSubmitting(false)

        if (result?.error) {
            alert(result.error)
        } else {
            alert('Solicitação enviada com sucesso! Aguarde a aprovação.')
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-brand/20 p-6 rounded-2xl w-full max-w-md relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                >
                    ✕
                </button>
                <div className="mb-6">
                    <div className="text-xs text-brand font-bold uppercase tracking-wider mb-1">Candidatura</div>
                    <h3 className="text-xl font-bold text-white">Ser Gerente de {groupName}</h3>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="groupId" value={groupId} />

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Por que você quer gerenciar este grupo?
                        </label>
                        <textarea
                            name="reason"
                            required
                            placeholder="Conte-nos sobre sua experiência, planos para a comunidade, etc."
                            className="w-full h-32 bg-black/50 border border-zinc-700 rounded-xl p-4 text-white text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-zinc-400 text-sm hover:text-white font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-brand text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-brand/90 disabled:opacity-50 shadow-lg shadow-brand/20"
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
