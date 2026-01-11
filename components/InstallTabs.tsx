'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function InstallTabs() {
    const [activeTab, setActiveTab] = useState<'ios' | 'aos'>('ios')

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl mb-12 border border-white/5">
                <button
                    onClick={() => setActiveTab('ios')}
                    className={`flex items-center justify-center gap-3 py-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'ios'
                        ? 'bg-zinc-800 text-white shadow-xl ring-1 ring-white/10'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                        }`}
                >
                    <span className="text-2xl">🍎</span>
                    <span className="tracking-wide">iOS (iPhone)</span>
                </button>
                <button
                    onClick={() => setActiveTab('aos')}
                    className={`flex items-center justify-center gap-3 py-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'aos'
                        ? 'bg-zinc-800 text-white shadow-xl ring-1 ring-white/10'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                        }`}
                >
                    <span className="text-2xl">🤖</span>
                    <span className="tracking-wide">AOS (Android)</span>
                </button>
            </div>

            {/* Content */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'ios' ? (
                    <div className="relative">
                        <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-zinc-800/50 md:left-[2.25rem]"></div>
                        <div className="space-y-10 relative">
                            <InstallStep
                                step={1}
                                title="Abra no Safari"
                                description={<>Acesse este site usando o navegador <span className="text-white font-bold">Safari</span>.</>}
                                icon={<SafariIcon />}
                            />
                            <InstallStep
                                step={2}
                                title="Toque no Botão 'Compartilhar'"
                                description={<>Na barra inferior do navegador, procure pelo ícone de <span className="text-white font-bold">seta para cima</span>.</>}
                                icon={<ShareIconIOS />}
                            />
                            <InstallStep
                                step={3}
                                title="Selecione 'Adicionar à Tela de Início'"
                                description={<>Role o menu para baixo ou para o lado até encontrar a opção <span className="text-white font-bold">"Adicionar à Tela de Início"</span> (Add to Home Screen).</>}
                                icon={<PlusSquareIcon />}
                            />
                            <InstallStep
                                step={4}
                                title="Confirme a Instalação"
                                description={<>Toque em <span className="text-brand font-bold">Adicionar</span> no canto superior direito. O ícone do app aparecerá na sua tela inicial!</>}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-zinc-800/50 md:left-[2.25rem]"></div>
                        <div className="space-y-10 relative">
                            <InstallStep
                                step={1}
                                title="Abra no Chrome"
                                description={<>Para melhor experiência, acesse pelo <span className="text-white font-bold">Google Chrome</span>.</>}
                                icon={<ChromeIcon />}
                            />
                            <InstallStep
                                step={2}
                                title="Toque no Menu"
                                description={<>Toque no ícone de <span className="text-white font-bold">três pontos (⋮)</span> no canto superior direito do navegador.</>}
                                icon={<MenuIconAndroid />}
                            />
                            <InstallStep
                                step={3}
                                title="Selecione 'Instalar App'"
                                description={<>Procure por <span className="text-white font-bold">"Instalar aplicativo"</span> ou "Adicionar à tela inicial" no menu.</>}
                                icon={<PhoneArrowDownIcon />}
                            />
                            <InstallStep
                                step={4}
                                title="Confirme"
                                description={<>Siga as instruções na tela e toque em <span className="text-brand font-bold">Instalar</span>. Pronto!</>}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function InstallStep({ step, title, description, icon }: { step: number; title: string; description: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <div className="flex gap-6 group">
            <div className="flex-none relative">
                {/* Step Circle */}
                <div className="flex items-center justify-center w-16 h-16 md:w-[4.5rem] md:h-[4.5rem] rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-brand/50 group-hover:bg-zinc-800 transition-all shadow-lg z-10 relative">
                    {icon ? (
                        <div className="text-white">{icon}</div>
                    ) : (
                        <span className="text-2xl font-bold text-zinc-500 group-hover:text-brand transition-colors">{step}</span>
                    )}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand flex items-center justify-center text-[10px] font-bold text-white border-2 border-background">
                        {step}
                    </div>
                </div>
            </div>
            <div className="flex-1 py-1">
                <h3 className="font-bold text-xl text-white mb-2 group-hover:text-brand transition-colors">
                    {title}
                </h3>
                <p className="text-zinc-400 text-base leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    )
}

// Icons
function ShareIconIOS() {
    return (
        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
    )
}

function PlusSquareIcon() {
    return (
        <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}

function MenuIconAndroid() {
    return (
        <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
        </svg>
    )
}

function SafariIcon() {
    return (
        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.553 16.505L8.52 15.48l-.98-3.953 4.032-1.025 3.98 1.025.98 3.953-3.98 1.025z" />
        </svg>
    )
}

function ChromeIcon() {
    return (
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5l4.5 9-9-1.5 4.5-7.5z" />
        </svg>
    )
}

function PhoneArrowDownIcon() {
    return (
        <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    )
}
