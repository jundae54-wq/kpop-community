import { Group } from '@/types/database'

type BadgeRendererProps = {
    badgeId: string | null
    groups: Group[]
    className?: string
    variant?: 'default' | 'gold'
}

export function BadgeRenderer({ badgeId, groups, className = "", variant = 'default' }: BadgeRendererProps) {
    if (!badgeId || !badgeId.startsWith('badge_')) return null

    const groupId = parseInt(badgeId.split('_')[1])
    const group = groups.find(g => g.id == groupId)

    if (!group) return null

    // Generate a simple colored badge or icon based on group name
    const style = variant === 'gold'
        ? "bg-gradient-to-r from-amber-300 to-yellow-500 text-black border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
        : "bg-zinc-800 border-white/10 text-zinc-300"

    return (
        <span
            className={`inline-flex items-center justify-center px-1.5 py-0.5 mx-1 rounded text-[10px] font-bold border ${style} ${className}`}
            title={variant === 'gold' ? `Moderador de ${group.name}` : group.name}
        >
            {variant === 'gold' && <span className="mr-0.5">👑</span>}
            {group.name.slice(0, 3).toUpperCase()}
        </span>
    )
}
