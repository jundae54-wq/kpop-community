'use client'

import { useState } from 'react'
import { sendMessage } from '@/app/messages/actions'

export default function MessageManagerButton({ managerId, managerName }: { managerId: string, managerName: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSending, setIsSending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsSending(true)
        if (!confirm(`Enviar mensagem para ${managerName}? Custará 5 pontos.`)) {
            setIsSending(false)
            return
        }

        const result = await sendMessage(formData)
        setIsSending(false)

        if (result?.error) {
            alert(result.error)
        } else {
            alert('Mensagem enviada com sucesso!')
            setIsOpen(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs bg-brand/10 text-brand px-3 py-1 rounded-full hover:bg-brand/20 transition-colors font-bold flex items-center gap-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                </svg>
                Msg (5pts)
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-zinc-900 border border-brand/20 p-6 rounded-2xl w-full max-w-sm relative">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                >
                    ✕
                </button>
                <h3 className="text-lg font-bold text-white mb-4">Enviar Mensagem</h3>
                <p className="text-sm text-zinc-400 mb-4">
                    Para: <span className="text-brand font-bold">{managerName}</span><br />
                    Custo: <span className="text-yellow-400 font-bold">5 Pontos</span>
                </p>

                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="receiverId" value={managerId} />
                    <textarea
                        name="content"
                        required
                        placeholder="Escreva sua mensagem..."
                        className="w-full h-32 bg-black/50 border border-zinc-700 rounded-lg p-3 text-white text-sm focus:border-brand outline-none"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-zinc-400 text-sm hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSending}
                            className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand/90 disabled:opacity-50"
                        >
                            {isSending ? 'Enviando...' : 'Enviar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
