'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function InstallTabs() {
    const [activeTab, setActiveTab] = useState<'ios' | 'aos'>('ios')

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl mb-8">
                <button
                    onClick={() => setActiveTab('ios')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'ios'
                        ? 'bg-zinc-800 text-white shadow-lg'
                        : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    <span className="text-xl">🍎</span>
                    iOS (iPhone)
                </button>
                <button
                    onClick={() => setActiveTab('aos')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'aos'
                        ? 'bg-zinc-800 text-white shadow-lg'
                        : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    <span className="text-xl">🤖</span>
                    AOS (Android)
                </button>
            </div>

            {/* Content */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'ios' ? (
                    <div className="space-y-8">
                        <InstallStep
                            step={1}
                            title="Abra no Safari"
                            description="Este guia funciona melhor no navegador Safari."
                        />
                        <InstallStep
                            step={2}
                            title="Toque em 'Compartilhar'"
                            description="Procure o ícone de compartilhamento na barra inferior."
                            icon={<ShareIconIOS />}
                        />
                        <InstallStep
                            step={3}
                            title="Selecione 'Adicionar à Tela de Início'"
                            description="Role para baixo e encontre esta opção."
                            placeholderText="Screenshot do Menu iOS"
                        />
                        <InstallStep
                            step={4}
                            title="Confirme"
                            description="Toque em 'Adicionar' no canto superior direito. Pronto!"
                        />
                    </div>
                ) : (
                    <div className="space-y-8">
                        <InstallStep
                            step={1}
                            title="Abra no Chrome"
                            description="Funciona melhor no Google Chrome."
                        />
                        <InstallStep
                            step={2}
                            title="Toque no Menu (3 pontos)"
                            description="No canto superior direito do navegador."
                            icon={<MenuIconAndroid />}
                        />
                        <InstallStep
                            step={3}
                            title="Selecione 'Instalar App' ou 'Adicionar à Tela'"
                            description="O nome pode variar dependendo da versão."
                            placeholderText="Screenshot do Menu Android"
                        />
                        <InstallStep
                            step={4}
                            title="Instalar"
                            description="Confirme a instalação e o ícone aparecerá na sua tela inicial."
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

function InstallStep({ step, title, description, icon, placeholderText }: { step: number; title: string; description: string; icon?: React.ReactNode; placeholderText?: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white font-bold text-sm">
                {step}
            </div>
            <div className="flex-1 space-y-3">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    {title}
                    {icon}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    {description}
                </p>
                {placeholderText && (
                    <div className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/50 flex items-center justify-center flex-col gap-2 p-4 text-center">
                        <span className="text-2xl">📸</span>
                        <span className="text-zinc-600 text-xs font-mono uppercase tracking-wider">{placeholderText}</span>
                        <span className="text-zinc-700 text-[10px]">(Usuário deve inserir imagem aqui)</span>
                    </div>
                )}
            </div>
        </div>
    )
}

function ShareIconIOS() {
    return (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
    )
}

function MenuIconAndroid() {
    return (
        <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
    )
}
