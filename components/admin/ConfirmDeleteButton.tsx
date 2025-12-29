'use client'

type ConfirmDeleteButtonProps = {
    action: (formData: FormData) => void
    itemId: string
    itemType: 'user' | 'post' | 'comment'
    confirmMessage?: string
}

export function ConfirmDeleteButton({ action, itemId, itemType, confirmMessage }: ConfirmDeleteButtonProps) {
    const defaultMessages = {
        user: 'Delete user? This cannot be undone.',
        post: 'Delete post?',
        comment: 'Delete comment?'
    }

    return (
        <form
            action={action}
            onSubmit={(e) => {
                if (!confirm(confirmMessage || defaultMessages[itemType])) {
                    e.preventDefault()
                }
            }}
        >
            <input type="hidden" name={`${itemType}Id`} value={itemId} />
            <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded transition-colors"
            >
                Delete
            </button>
        </form>
    )
}
