<template>
    <!-- Модальное окно с маской фокуса -->
    <div 
      v-if="isVisible" 
      class="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
      style="z-index: 9999 !important;"
      @click="closeModal"
    >
      <!-- Содержимое модального окна -->
      <div 
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full pt-8"
        style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);"
        @click.stop
      >
        <div class="flex flex-col items-center justify-center gap-4 h-full">
           <!-- Таймер обратного отсчета -->
           <div class="flex items-center justify-center mb-4">
            <div class="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                <!-- Фоновый круг -->
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="#E5E7EB"
                  stroke-width="2"
                  fill="none"
                />
                <!-- Прогресс таймера -->
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="#11AE78"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  :stroke-dasharray="`${2 * Math.PI * 18}`"
                  :stroke-dashoffset="`${2 * Math.PI * 18 * (1 - (totalTime - countdown) / totalTime)}`"
                  class="transition-all duration-1000 ease-linear"
                />
              </svg>
              <!-- Время в центре -->
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-sm sm:text-base lg:text-lg font-bold text-[#11AE78]">
                  {{ countdown }}
                </span>
              </div>
            </div>
          </div>
          
          <img src="../assets/med-icon.svg" alt="med-icon" class="w-40 sm:w-52 lg:w-60 h-12 sm:h-14 lg:h-16" />
          <img src="../assets/yandex.svg" alt="dost" class="w-40 sm:w-52 lg:w-60 h-12 sm:h-14 lg:h-16 my-2" />

          <nav class="flex flex-col justify-between items-center bg-[#E8F4F2] w-full py-6 rounded-2xl" >
          <div class="text-center text-sm sm:text-base lg:text-lg font-bold  leading-tight my-3 sm:my-4" v-html="t('static_ad_title')">
          </div>
          
         
          
          <img src="../assets/qr.svg" alt="qr" class="w-24 sm:w-28 lg:w-32 h-24 sm:h-28 lg:h-32" />
          
          <a 
            href="http://medcontact.ai" 
            target="_blank"
            class="text-green-700 font-bold text-md hover:text-green-800 transition-colors mb-6 mt-10"
          >
          <span class="text-green-700 font-bold text-sm sm:text-base lg:text-lg hover:text-green-800 transition-colors">
            http://medcontact.ai
          </span>
          </a>
          
      
          <!-- Кнопка закрытия -->
          <div 
            @click="closeModal" 
            class=" m-auto px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-white border-2 border-[#11AE78] text-[#11AE78] font-medium hover:bg-green-50 transition-all duration-300 transform hover:scale-105 cursor-pointer text-sm sm:text-base"
          >
            {{ t('static_ad_close') }}
          </div>
          </nav>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, onUnmounted } from 'vue'
  import { useUserStore } from '../store/index'
  import { useI18n } from 'vue-i18n'
  import { useSoundControl } from '../composables/useSoundControl'
 
  
  // Props
  const props = defineProps<{
    isVisible: boolean
  }>()
  
  // Emits
  const emit = defineEmits<{
    close: []
  }>()

  const userStore = useUserStore()
  const { t } = useI18n()
  const { disableSound, enableSound } = useSoundControl()
  

  // Таймер обратного отсчета
  const countdown = ref(10)
  const totalTime = 10
  let countdownInterval: number | null = null

  const closeModal = () => {
    stopCountdown()
    userStore.clearIin()
    emit('close')
  }

  const startCountdown = () => {
    countdown.value = 10
    
    // Очищаем предыдущий таймер если есть
    if (countdownInterval) {
      clearInterval(countdownInterval)
    }
    
    countdownInterval = window.setInterval(() => {
      countdown.value--
      
      if (countdown.value <= 0) {
        // Таймер истек - очищаем iin из store и сбрасываем звук
        userStore.clearIin()
        
        // Дополнительная очистка - проверяем localStorage и sessionStorage
        localStorage.removeItem('iin')
        sessionStorage.removeItem('iin')
        
        // Принудительно обновляем store
        userStore.$patch({ iin: '' })
        
        // Сбрасываем звук: выключаем и включаем обратно
        disableSound()
      
        
        // Включаем звук обратно через небольшую задержку
        setTimeout(() => {
          enableSound()
          
        }, 100)
        
        stopCountdown()
        emit('close')
      }
    }, 1000)
  }

  const stopCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }

  // Запускаем таймер когда модалка становится видимой
  watch(() => props.isVisible, (visible) => {
    if (visible) {
      startCountdown()
    } else {
      stopCountdown()
    }
  }, { immediate: true })

  onUnmounted(() => {
    stopCountdown()
  })
  </script>