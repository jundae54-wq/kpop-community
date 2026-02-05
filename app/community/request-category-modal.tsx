'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function RequestCategoryModal({
    isOpen,
    onClose,
    type
}: {
    isOpen: boolean
    onClose: () => void
    type: 'idol' | 'actor'
}) {
    const [name, setName] = useState('')
    const [reason, setReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert('Faça login para solicitar uma categoria.')
            setIsSubmitting(false)
            return
        }

        const { error } = await supabase.from('category_requests').insert({
            user_id: user.id,
            name,
            type,
            reason
        })

        setIsSubmitting(false)

        if (error) {
            console.error(error)
            alert('Erro ao enviar solicitação.')
        } else {
            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                onClose()
                setName('')
                setReason('')
            }, 2000)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold text-white mb-4">
                    Solicitar Nova Categoria ({type === 'idol' ? 'Ídolo' : 'Ator'})
                </h2>

                {success ? (
                    <div className="py-10 text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <h3 className="text-lg font-bold text-white">Solicitação Enviada!</h3>
                        <p className="text-zinc-500 mt-2">O administrador irá analisar seu pedido em breve.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase">Nome do Artista/Grupo</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/50 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-brand"
                                placeholder="Ex: NewJeans, Park Seo-jun"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase">Motivo (Opcional)</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-black/50 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-brand h-24 resize-none"
                                placeholder="Por que devemos adicionar esta categoria?"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
