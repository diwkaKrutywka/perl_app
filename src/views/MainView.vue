<template>
    <div class="h-screen flex flex-col overflow-hidden w-full">
      <main class="flex-1 flex flex-col items-center justify-center px-4 py-2 sm:py-4 bg-white">
        <!-- Заголовки -->
        <div class="text-center mb-4 sm:mb-6">
          <div class="text-[#11AE78] font-bold text-lg sm:text-xl lg:text-2xl xl:text-3xl 4k:text-4xl 4k-plus:text-5xl mb-1 sm:mb-2 w-full max-w-4xl mx-auto leading-tight h-16 sm:h-20 lg:h-24 xl:h-28 4k:h-32 4k-plus:h-36 flex items-center justify-center" 
               style="font-size: 1.75rem !important;" 
               v-html="$t('self_service_terminal_kz')">
          </div>
          <div class="text-green-700 font-bold text-lg sm:text-xl lg:text-2xl xl:text-3xl 4k:text-4xl 4k-plus:text-5xl mb-1 sm:mb-2 w-full max-w-4xl mx-auto leading-tight h-16 sm:h-20 lg:h-24 xl:h-28 4k:h-32 4k-plus:h-36 flex items-center justify-center" 
               style="font-size: 1.75rem !important;" 
               v-html="$t('self_service_terminal_ru')">
          </div>
        </div>
  
        <!-- Видео контейнер -->
        <div class="mb-4 sm:mb-6">
          <UnifiedVideo 
            position="center" 
            :enable-rotation="true"
            instance-id="main-center"
            page-type="main"
            :muted="true"
          />
        </div>
  
        <!-- Кнопка запуска -->
        <div
          @click="startService"
          class="bttn bg-[#0C593E] hover:bg-[#0A4A33] text-white font-bold py-2 sm:py-3 lg:py-4 4k:py-6 4k-plus:py-8 px-8 sm:px-14 lg:px-16 xl:px-20 4k:px-24 4k-plus:px-28 rounded-full mt-4 text-base sm:text-lg lg:text-xl xl:text-2xl 4k:text-3xl 4k-plus:text-4xl cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
       Бастау |  Начать 
        </div>
      </main>
      <nav class="bg-[#E8F4F2] h-16 sm:h-16 lg:h-20 flex items-center justify-center shadow-sm w-full fixed bottom-0 left-0 right-0">
      <div class="text-green-600 text-[10px] sm:text-xs lg:text-sm xl:text-base">
      </div>
    </nav>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router'
 
  import UnifiedVideo from '../components/UnifiedVideo.vue'
  
  const router = useRouter()
  
  
  // Используем управление звуком
  //const { toggleSound, soundIcon, soundIconClass } = useSoundControl()
  
  const startService = () => {
    router.push('/language-selection')
  }
  </script>
  <style scoped>
  .bttn{
  
    padding: 0.7rem 1.5rem !important;
  }
  </style>