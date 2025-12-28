import Link from 'next/link'

export default function SignupConfirmationPage() {
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
            <div className="w-full max-w-md text-center space-y-8 rounded-2xl bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/50">
                    <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                </div>

                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Verifique seu email
                    </h2>
                    <p className="mt-4 text-base text-zinc-400">
                        Enviamos um link de confirmação para o seu endereço de email.
                        <br />
                        Clique no link para ativar sua conta e começar!
                    </p>
                </div>

                <div className="pt-4">
                    <Link href="/login" className="font-semibold text-brand hover:text-brand/80">
                        ← Voltar para o Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
