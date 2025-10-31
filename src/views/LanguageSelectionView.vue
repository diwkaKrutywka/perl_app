<template>
  <div class="h-screen bg-gradient-to-b from-[#E8F4F2] to-white flex flex-col overflow-hidden">

    <!-- Основной контент -->
    <main class="flex-1 flex flex-col items-center justify-center px-4 py-2 sm:py-4 bg-white">
      <!-- Заголовки -->
      <div class="text-center mb-4 sm:mb-6">
        <div class="text-[#11AE78] font-bold text-lg sm:text-xl lg:text-2xl xl:text-3xl 4k:text-4xl 4k-plus:text-5xl mb-1 sm:mb-2 w-full max-w-4xl mx-auto leading-tight  flex items-center justify-center" 
             style="font-size: 1.75rem !important;" 
             v-html="$t('welcome_kazakh')">
        </div>
        <div class="text-green-700 font-bold text-lg sm:text-xl lg:text-2xl xl:text-3xl 4k:text-4xl 4k-plus:text-5xl mb-1 sm:mb-2 w-full max-w-4xl mx-auto leading-tight h-16 sm:h-20 lg:h-24 xl:h-28 4k:h-32 4k-plus:h-36 flex items-center justify-center" 
             style="font-size: 1.75rem !important;" 
             v-html="$t('welcome_russian')">
        </div>
      </div>

      <!-- Видео контейнер -->
      <div class="mb-4 sm:mb-6">
        <UnifiedVideo 
          position="center" 
          :enable-rotation="true"
          instance-id="language-center"
          page-type="language"
        />
      </div>

      <!-- Кнопки выбора языка -->
      <div class="font-base mb-3 sm:mb-4 text-sm sm:text-base md:text-lg 2xl:text-lg flex items-center"> 
      Тілді таңдаңыз  |  Выберите язык
      </div>
      <div class="flex  sm:flex-row gap-4 sm:gap-6">
       
        <div 
          @click="selectLanguage('kk')"
          class="bg-[#0C593E] hover:bg-[#0A4A33] text-white w-28 sm:w-32 md:w-48 lg:w-48 xl:w-40 4k:w-44 4k-plus:w-48 font-bold py-2 sm:py-3 lg:py-4 4k:py-6 4k-plus:py-8 px-4 sm:px-6 lg:px-8 xl:px-10 4k:px-12 4k-plus:px-14 rounded-full text-base sm:text-lg lg:text-xl xl:text-2xl 4k:text-3xl 4k-plus:text-4xl cursor-pointer flex items-center justify-center text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          style="font-size: 1.5rem !important;"
        >
          {{ $t('language_kazakh') }}
        </div>
        <div 
          @click="selectLanguage('ru')"
          class="bg-[#0C593E] hover:bg-[#0A4A33] text-white w-28 sm:w-32 md:w-48 lg:w-48 xl:w-40 4k:w-44 4k-plus:w-48 font-bold py-2 sm:py-3 lg:py-4 4k:py-6 4k-plus:py-8 px-4 sm:px-6 lg:px-8 xl:px-10 4k:px-12 4k-plus:px-14 rounded-full text-base sm:text-lg lg:text-xl xl:text-2xl 4k:text-3xl 4k-plus:text-4xl cursor-pointer flex items-center justify-center text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          style="font-size: 1.5rem !important;"
        >
          {{ $t('language_russian') }}
        </div>
      </div>
    </main>

    <!-- Нижняя навигация -->
    <FooterNav :showBackButton="false" :showQR="false" :showLanguageButton="false" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import FooterNav from '../components/FooterNav.vue'
import UnifiedVideo from '../components/UnifiedVideo.vue'

const router = useRouter()
const { locale } = useI18n()

const selectLanguage = async (lang: string) => {
  // Сохраняем в localStorage
  localStorage.setItem('currentLang', lang)
  
  // Обновляем реактивную локализацию
  locale.value = lang
  
  // Переход на главную страницу через router (динамически)
  setTimeout(() => {
    router.push('/home')
  }, 300)
}
</script>
