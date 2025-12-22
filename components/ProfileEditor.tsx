'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/auth/actions'

interface ProfileEditorProps {
    user: {
        id: string
        email?: string
        full_name?: string
        avatar_url?: string
    }
}

export default function ProfileEditor({ user }: ProfileEditorProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || `https://api.dicebear.com/9.x/lorelei/svg?seed=${user.email}`)
    const [isLoadingAvatar, setIsLoadingAvatar] = useState(false)

    const generateRandomAvatar = (gender: 'male' | 'female') => {
        setIsLoadingAvatar(true)
        const randomSeed = Math.random().toString(36).substring(7)
        // Lorelei is lighter and faster.
        let url = `https://api.dicebear.com/9.x/lorelei/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`

        if (gender === 'male') {
            url += `&eyebrows=variant09,variant10`
        } else {
            url += `&eyebrows=variant02,variant05`
        }

        setAvatarUrl(url)
    }

    if (!isEditing) {
        return (
            <div className="mb-8 rounded-2xl bg-zinc-900/50 p-6 border border-white/5 backdrop-blur-xl flex items-center justify-between group hover:border-brand/30 transition-all">
                <div className="flex items-center gap-5">
                    <div className="relative h-20 w-20 rounded-full bg-zinc-800 overflow-hidden ring-4 ring-zinc-900 shadow-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            {user.full_name || 'Anonymous'}
                        </h1>
                        <p className="text-zinc-400">{user.email}</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-full bg-white/5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                    Editar Perfil
                </button>
            </div>
        )
    }

    return (
        <form action={async (formData) => {
            await updateProfile(formData)
            setIsEditing(false)
        }} className="mb-8 rounded-2xl bg-zinc-900/50 p-6 border border-brand/50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
            <h2 className="text-lg font-bold text-white mb-6">Editar Perfil</h2>

            <div className="flex flex-col sm:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative h-24 w-24 rounded-full bg-zinc-800 overflow-hidden ring-4 ring-brand/20 shadow-xl bg-white/5 flex items-center justify-center">
                        {isLoadingAvatar && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 z-10 transition-opacity duration-300">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent"></div>
                            </div>
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={avatarUrl}
                            alt="Avatar Preview"
                            className="h-full w-full object-cover transition-opacity duration-300"
                            style={{ opacity: isLoadingAvatar ? 0 : 1 }}
                            onLoad={() => setIsLoadingAvatar(false)}
                        />
                    </div>
                    <input type="hidden" name="avatarUrl" value={avatarUrl} />

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => generateRandomAvatar('male')}
                            className="px-3 py-1.5 rounded-full bg-blue-500/10 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                            disabled={isLoadingAvatar}
                        >
                            🎲 Garoto
                        </button>
                        <button
                            type="button"
                            onClick={() => generateRandomAvatar('female')}
                            className="px-3 py-1.5 rounded-full bg-pink-500/10 text-xs font-medium text-pink-400 hover:bg-pink-500/20 transition-colors disabled:opacity-50"
                            disabled={isLoadingAvatar}
                        >
                            🎲 Garota
                        </button>
                    </div>
                </div>

                {/* Inputs */}
                <div className="flex-1 space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-zinc-400 mb-1">Nome de Exibição</label>
                        <input
                            type="text"
                            name="fullName"
                            defaultValue={user.full_name || ''}
                            placeholder="Digite seu apelido"
                            className="w-full rounded-lg bg-zinc-950 border border-white/10 p-3 text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                        />
                    </div>
                    {/* Could add Bio here later */}

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all"
                        >
                            Salvar Alterações
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false)
                                setAvatarUrl(user.avatar_url || `https://api.dicebear.com/9.x/lorelei/svg?seed=${user.email}`)
                            }}
                            className="rounded-full px-6 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}
