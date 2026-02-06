'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'react-hot-toast'

export function AdminToastListener() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const success = searchParams.get('success')
        const error = searchParams.get('error')

        if (success) {
            toast.success('Operação realizada com sucesso!', {
                style: {
                    background: '#10B981',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#10B981',
                },
            })
        }

        if (error) {
            toast.error(decodeURIComponent(error), {
                style: {
                    background: '#EF4444',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#EF4444',
                },
            })
        }

        if (success || error) {
            // Clear params
            const params = new URLSearchParams(searchParams.toString())
            params.delete('success')
            params.delete('error')
            router.replace(`${pathname}?${params.toString()}`)
        }
    }, [searchParams, pathname, router])

    return null
}
