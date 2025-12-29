import Link from 'next/link'

export default function ResetConfirmationPage() {
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-brand">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-white">
                    Verifique seu email
                </h2>

                <div className="text-zinc-400 space-y-2">
                    <p>
                        Enviamos um link de redefinição de senha para o seu endereço de email.
                    </p>
                    <p className="text-sm">
                        Não recebeu? Verifique sua pasta de spam ou tente novamente.
                    </p>
                </div>

                <div className="pt-4">
                    <Link
                        href="/login"
                        className="text-sm font-semibold text-brand hover:text-brand/80"
                    >
                        ← Voltar para Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
