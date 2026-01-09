import InstallTabs from '@/components/InstallTabs'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Instalar App | K-Community',
    description: 'Guia passo a passo para instalar o K-Community no seu celular (iOS e Android).',
}

export default function InstallPage() {
    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="mx-auto max-w-2xl px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Instale o App 📲
                    </h1>
                    <p className="text-zinc-400 leading-relaxed">
                        Adicione o K-Community à sua tela inicial para acesso rápido,
                        tela cheia e melhor desempenho. É grátis e leve!
                    </p>
                </div>

                <InstallTabs />
            </div>
        </div>
    )
}
