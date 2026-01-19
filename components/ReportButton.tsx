'use client'

import { useState } from 'react'
import { submitReport } from '@/app/actions/reporting'

type ReportButtonProps = {
    targetType: 'post' | 'comment'
    targetId: number
    iconOnly?: boolean
}

export default function ReportButton({ targetType, targetId, iconOnly = false }: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        const result = await submitReport(formData)
        setIsSubmitting(false)

        if (result?.error) {
            alert(result.error)
        } else {
            alert('Denúncia enviada. Obrigado por ajudar a manter a comunidade segura.')
            setIsOpen(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`text-zinc-500 hover:text-red-500 transition-colors ${iconOnly ? '' : 'flex items-center gap-1 text-xs'}`}
                title="Denunciar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 014.5 2h6.864a1.5 1.5 0 011.298.748l1.978 3.013a1.5 1.5 0 010 1.625l-1.978 3.014a1.5 1.5 0 01-1.298.748H4.5A1.5 1.5 0 013 9.682V3.5zM3 13.5V17a.5.5 0 001 0v-4h11.25a.75.75 0 000-1.5H4.5a1.5 1.5 0 00-1.5 1.5z" clipRule="evenodd" />
                </svg>
                {!iconOnly && <span>Denunciar</span>}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-zinc-900 border border-brand/20 p-6 rounded-2xl w-full max-w-sm relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-bold text-white mb-4">Denunciar {targetType === 'post' ? 'Post' : 'Comentário'}</h3>

                        <form action={handleSubmit} className="space-y-4">
                            <input type="hidden" name="targetType" value={targetType} />
                            <input type="hidden" name="targetId" value={targetId} />

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-2">Motivo</label>
                                <select
                                    name="reason"
                                    required
                                    className="w-full bg-black/50 border border-zinc-700 rounded-lg p-2 text-white text-sm focus:border-brand outline-none"
                                >
                                    <option value="">Selecione um motivo...</option>
                                    <option value="spam">Spam ou Propaganda</option>
                                    <option value="abuse">Abuso ou Assédio</option>
                                    <option value="inappropriate">Conteúdo Inadequado</option>
                                    <option value="misinformation">Informação Falsa</option>
                                    <option value="other">Outro</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-zinc-400 text-sm hover:text-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Enviando...' : 'Enviar Denúncia'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
