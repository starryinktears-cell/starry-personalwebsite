export type Language = 'zh' | 'en'

export const LANGUAGE_STORAGE_KEY = 'studio-language'

export const copy = (language: Language, english: string, chinese: string) => language === 'zh' ? chinese : english

export const languageLabel = (language: Language) => language === 'zh' ? 'English' : '中文'

export const languageName = (language: Language) => language === 'zh' ? '中文' : 'English'
