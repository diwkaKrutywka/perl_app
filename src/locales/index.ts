import { createI18n } from 'vue-i18n'

// Импорт словарей (убери `.ts` в импортах — это лишнее)
import kk from './language/kk'
import ru from './language/ru'
import en from './language/en'

// Типы локалей
type MessageSchema = typeof kk // можно взять тип из одного языка, если ключи совпадают

// Получаем язык из localStorage или устанавливаем по умолчанию
let currentLang = 'kk' // По умолчанию казахский

// Проверяем localStorage только если он доступен (не в SSR)
if (typeof window !== 'undefined' && localStorage) {
  const storedLang = localStorage.getItem('currentLang')
  if (storedLang) {
    currentLang = storedLang
  }
}

// Список доступных языков
const availableLanguages = ['kk', 'ru', 'en'] as const

// Проверка языка
if (!availableLanguages.includes(currentLang as any)) {
  currentLang = 'kk'
}

// Создание i18n-инстанса
const i18n = createI18n<[MessageSchema], typeof currentLang>({
  legacy: false,
  globalInjection: true,
  locale: currentLang,
  fallbackLocale: 'kk',
  warnHtmlMessage: false,
  messages: {
    kk,
    ru,
    en
  }
})


export default i18n
