'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export function RewardToast() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const [show, setShow] = useState(false)
    const [amount, setAmount] = useState(0)

    useEffect(() => {
        const reward = searchParams.get('reward')
        if (reward) {
            setAmount(parseInt(reward))
            setShow(true)

            // Hide after a delay
            const timer = setTimeout(() => {
                setShow(false)
            }, 5000)

            // Remove query param without refresh
            const params = new URLSearchParams(searchParams.toString())
            params.delete('reward')
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })

            return () => clearTimeout(timer)
        }
    }, [searchParams, pathname, router])

    if (!show) return null

    return (
        <div className="fixed top-20 right-4 z-50 animate-bounce-in">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-white/20">
                <div className="text-3xl">🎉</div>
                <div>
                    <h4 className="font-bold text-lg">Bônus Diário!</h4>
                    <p className="text-yellow-100 text-sm">Você ganhou +{amount} pontos por entrar hoje.</p>
                </div>
                <button
                    onClick={() => setShow(false)}
                    className="ml-2 text-white/50 hover:text-white"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}
