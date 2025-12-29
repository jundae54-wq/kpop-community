import Link from 'next/link'

export default function SignupVerifiedPage() {
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
            <div className="w-full max-w-md text-center space-y-8 rounded-2xl bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/50">
                    <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Email Verificado!
                    </h2>
                    <p className="mt-4 text-base text-zinc-400">
                        Sua conta foi ativada com sucesso.
                        <br />
                        Agora você pode fazer login e aproveitar.
                    </p>
                </div>

                <div className="pt-4">
                    <Link
                        href="/login"
                        className="group relative flex w-full justify-center rounded-lg bg-brand px-3 py-3 text-sm font-semibold text-white hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand transition-all duration-200"
                    >
                        Ir para Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
