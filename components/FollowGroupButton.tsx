'use client'

import { useState } from 'react'
import { toggleFollow, toggleEmailNotification } from '@/app/actions/follow'
import { toast } from 'react-hot-toast'
import { usePathname } from 'next/navigation'

interface Props {
    groupId: number
    initialIsFollowing: boolean
    initialWantsEmail: boolean
    isLoggedIn: boolean
}

export function FollowGroupButton({ groupId, initialIsFollowing, initialWantsEmail, isLoggedIn }: Props) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [wantsEmail, setWantsEmail] = useState(initialWantsEmail)
    const [isLoading, setIsLoading] = useState(false)
    const pathname = usePathname()

    const handleFollowToggle = async () => {
        if (!isLoggedIn) {
            toast.error('Faça login para seguir o grupo!')
            return
        }

        setIsLoading(true)
        const newStatus = !isFollowing
        
        // Optimistic UI update
        setIsFollowing(newStatus)
        if (!newStatus) setWantsEmail(false) // Reset email if unfollowing

        const result = await toggleFollow(groupId, !newStatus, pathname)
        
        if (result.error) {
            toast.error('Erro ao atualizar. Tente novamente.')
            setIsFollowing(!newStatus) // Revert on error
        } else {
            toast.success(newStatus ? 'Você está seguindo este grupo!' : 'Você deixou de seguir o grupo.')
        }
        setIsLoading(false)
    }

    const handleEmailToggle = async () => {
        if (!isFollowing) return

        setIsLoading(true)
        const newEmailStatus = !wantsEmail
        setWantsEmail(newEmailStatus) // Optimistic

        const result = await toggleEmailNotification(groupId, newEmailStatus, pathname)
        
        if (result.error) {
            toast.error('Erro ao atualizar notificações.')
            setWantsEmail(!newEmailStatus) // Revert
        } else {
            toast.success(newEmailStatus ? 'Notificações ativadas!' : 'Notificações desativadas.')
        }
        setIsLoading(false)
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <button
                onClick={handleFollowToggle}
                disabled={isLoading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg ${
                    isFollowing 
                        ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700' 
                        : 'bg-brand text-white hover:bg-brand/90 shadow-brand/20'
                } disabled:opacity-50`}
            >
                {isFollowing ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-brand">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        Seguindo
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                        Seguir Grupo
                    </>
                )}
            </button>

            {/* Email Notification Toggle (Only show if following) */}
            <div className={`flex items-center gap-3 transition-opacity duration-300 ${isFollowing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">Receber emails de novos posts</span>
                <button 
                    onClick={handleEmailToggle}
                    disabled={isLoading || !isFollowing}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                        wantsEmail ? 'bg-brand' : 'bg-zinc-700'
                    }`}
                >
                    <span className="sr-only">Ativar notificações por email</span>
                    <span 
                        className={`pointer-events-none absolute left-0.5 inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            wantsEmail ? 'translate-x-4' : 'translate-x-0'
                        }`} 
                    />
                </button>
            </div>
        </div>
    )
}
