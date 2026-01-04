'use client'

import { useState } from 'react'
import { toggleLike, togglePin } from '@/app/actions/post-interactions'
import { useRouter } from 'next/navigation'

interface PostActionsProps {
    postId: number
    initialLikes: number
    initialIsLiked: boolean
    isPinned: boolean
    canPin: boolean // Admin or Mod
    groupId?: number
}

export function PostActions({ postId, initialLikes, initialIsLiked, isPinned, canPin, groupId }: PostActionsProps) {
    const [likes, setLikes] = useState(initialLikes)
    const [isLiked, setIsLiked] = useState(initialIsLiked)
    const [isPinnedState, setIsPinnedState] = useState(isPinned)
    const [isSharing, setIsSharing] = useState(false)
    const router = useRouter()

    const handleLike = async () => {
        // Optimistic UI
        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setLikes(prev => newIsLiked ? prev + 1 : prev - 1)

        await toggleLike(postId)
        router.refresh()
    }

    const handlePin = async () => {
        setIsPinnedState(!isPinnedState)
        await togglePin(postId, groupId)
        router.refresh()
    }

    const handleShare = async () => {
        setIsSharing(true)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    text: 'Confira este post na K-Community!',
                    url: window.location.href,
                })
            } catch (error) {
                console.log('Error sharing', error)
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href)
                alert('Link copiado para a área de transferência!')
            } catch (err) {
                console.error('Failed to copy: ', err)
            }
        }
        setIsSharing(false)
    }

    return (
        <div className="flex items-center gap-4 mt-6 border-t border-white/10 pt-4">
            {/* Like Button */}
            <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isLiked
                    ? 'bg-pink-500/20 text-pink-500'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${isLiked ? 'animate-pulse-once' : ''}`}>
                    <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.16-1.1c-1.07-1.09-2.065-2.226-2.96-3.32-1.78-2.176-2.9-4.24-2.9-6.07C2.609 3.52 4.137 2 6.096 2c1.035 0 1.956.495 2.565 1.275A3.91 3.91 0 0111.235 2c1.96 0 3.487 1.52 3.487 4.405 0 1.83-1.118 3.894-2.898 6.07-.896 1.093-1.89 2.228-2.962 3.32-.383.39-.773.77-1.162 1.102l-.018.01-.005.003a.5.5 0 01-.024.017.5.5 0 01-.026-.017z" />
                </svg>
                <span className="font-semibold text-sm">{likes}</span>
            </button>

            {/* Share Button */}
            <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all hover:text-white"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.51 2.51 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.367A2.5 2.5 0 0113 4.5z" />
                </svg>
                <span className="text-sm font-medium">Compartilhar</span>
            </button>

            {/* Admin Pin Button */}
            {canPin && (
                <button
                    onClick={handlePin}
                    className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isPinnedState
                        ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                        : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transform rotate-45">
                        <path d="M10 2a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v2.39l3.22 3.22a.75.75 0 01-1.06 1.06L10.75 10.06v4.69l1.22 1.22a.75.75 0 11-1.06 1.06l-2-2a.75.75 0 010-1.06l2-2v-4.69l1.22 1.22a.75.75 0 11-1.06 1.06L10.75 10.06V7.75h-.5a.75.75 0 010-1.5h1.5V2.75A.75.75 0 0110 2z" />
                        <path fillRule="evenodd" d="M3.75 6a.75.75 0 01.75-.75h11a.75.75 0 010 1.5h-11A.75.75 0 013.75 6zM3.75 16a.75.75 0 01.75-.75h11a.75.75 0 010 1.5h-11A.75.75 0 013.75 16z" clipRule="evenodd" />
                        {/* Actually Pin Icon is safer */}
                        <path d="M10 2c-1.1 0-2 .9-2 2v2.586l-1.293 1.293A1 1 0 006 8.586V11h3v6h2v-6h3v-2.414a1 1 0 00-.293-.707L12 6.586V4c0-1.1-.9-2-2-2z" />
                    </svg>
                    <span className="text-sm font-bold">{isPinnedState ? 'Desafixar' : 'Fixar Global'}</span>
                </button>
            )}
        </div>
    )
}
