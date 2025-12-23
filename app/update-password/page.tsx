import { updatePassword } from '@/app/auth/actions'

export default function UpdatePasswordPage({
    searchParams,
}: {
    searchParams: { message?: string; error?: string }
}) {
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        Nova <span className="text-brand">Senha</span>
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Digite sua nova senha
                    </p>
                </div>

                <form className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="password" className="sr-only">
                            Nova senha
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            className="relative block w-full rounded-lg border-0 bg-zinc-800 py-3 px-4 text-white placeholder-zinc-400 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-brand sm:text-sm sm:leading-6"
                            placeholder="Nova senha (mínimo 6 caracteres)"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="sr-only">
                            Confirmar senha
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            minLength={6}
                            className="relative block w-full rounded-lg border-0 bg-zinc-800 py-3 px-4 text-white placeholder-zinc-400 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-brand sm:text-sm sm:leading-6"
                            placeholder="Confirmar nova senha"
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
                            formAction={updatePassword}
                            className="group relative flex w-full justify-center rounded-lg bg-brand px-3 py-3 text-sm font-semibold text-white hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand transition-all duration-200"
                        >
                            Atualizar Senha
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
