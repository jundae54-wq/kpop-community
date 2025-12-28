'use client'

import { signup } from '@/app/auth/actions'
import Link from 'next/link'
import { useState } from 'react'

export default function SignupForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)

        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.')
            setIsLoading(false)
            return
        }

        try {
            // Call server action
            await signup(formData)
        } catch (e) {
            // Usually redirect happens, so this might not be reached unless error is thrown
            setError('Algo deu errado. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4 rounded-md shadow-sm">
                <div>
                    <label htmlFor="fullName" className="sr-only">
                        Nome Completo
                    </label>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        disabled={isLoading}
                        className="relative block w-full rounded-lg border-0 bg-zinc-800 py-3 px-4 text-white placeholder-zinc-400 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-brand sm:text-sm sm:leading-6 disabled:opacity-50"
                        placeholder="Nome Completo (Apelido)"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="sr-only">
                        Endereço de email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        disabled={isLoading}
                        className="relative block w-full rounded-lg border-0 bg-zinc-800 py-3 px-4 text-white placeholder-zinc-400 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-brand sm:text-sm sm:leading-6 disabled:opacity-50"
                        placeholder="Endereço de email"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">
                        Senha
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        disabled={isLoading}
                        minLength={6}
                        className="relative block w-full rounded-lg border-0 bg-zinc-800 py-3 px-4 text-white placeholder-zinc-400 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-brand sm:text-sm sm:leading-6 disabled:opacity-50"
                        placeholder="Senha"
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="sr-only">
                        Confirmar Senha
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        disabled={isLoading}
                        minLength={6}
                        className="relative block w-full rounded-lg border-0 bg-zinc-800 py-3 px-4 text-white placeholder-zinc-400 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-brand sm:text-sm sm:leading-6 disabled:opacity-50"
                        placeholder="Confirmar Senha"
                    />
                </div>
            </div>

            {error && (
                <p className="mt-2 text-center text-sm text-red-400 bg-red-400/10 p-2 rounded">
                    {error}
                </p>
            )}

            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative flex w-full justify-center rounded-lg bg-brand px-3 py-3 text-sm font-semibold text-white hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Processando...
                        </div>
                    ) : (
                        'Criar Conta'
                    )}
                </button>
            </div>

            <div className="text-center text-sm">
                <span className="text-zinc-400">Já tem uma conta? </span>
                <Link href="/login" className="font-semibold text-brand hover:text-brand/80">
                    Entrar
                </Link>
            </div>
        </form>
    )
}
