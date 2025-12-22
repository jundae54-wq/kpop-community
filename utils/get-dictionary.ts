import 'server-only'

const dictionaries = {
    en: () => import('@/dictionaries/en').then((module) => module.en),
    pt: () => import('@/dictionaries/pt').then((module) => module.pt),
}

export const getDictionary = async (locale: string) => {
    // Default to 'en' if invalid locale
    if (locale !== 'pt' && locale !== 'en') {
        return dictionaries.en()
    }
    return dictionaries[locale as keyof typeof dictionaries]()
}
