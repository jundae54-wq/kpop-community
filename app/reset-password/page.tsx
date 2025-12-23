import Link from 'next/link'
import { requestPasswordReset } from '@/app/auth/actions'

export default function ResetPasswordPage({
    searchParams,
}: {
    searchParams: { message?: string; error?: string }
}) {
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        Redefinir <span className="text-brand">Senha</span>
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Digite seu email para receber o link de redefinição
                    </p>
                </div>

                <form className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Endereço de email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="relative block w-full rounded-lg border-0 bg-zinc-800 py-3 px-4 text-white placeholder-zinc-400 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-brand sm:text-sm sm:leading-6"
                            placeholder="Endereço de email"
                        />
                    </div>

                    {searchParams?.message && (
                        <p className="mt-2 text-center text-sm text-emerald-400 bg-emerald-400/10 p-3 rounded">
                            {searchParams.message}
                        </p>
                    )}

                    {searchParams?.error && (
                        <div className="mt-2 rounded-lg bg-red-500/20 p-3 text-center text-sm text-red-200 ring-1 ring-red-500/50">
                            {searchParams.error}
                        </div>
                    )}

                    <div>
                        <button
                            formAction={requestPasswordReset}
                            className="group relative flex w-full justify-center rounded-lg bg-brand px-3 py-3 text-sm font-semibold text-white hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand transition-all duration-200"
                        >
                            Enviar Link de Redefinição
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <Link href="/login" className="font-semibold text-brand hover:text-brand/80">
                            ← Voltar para Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
