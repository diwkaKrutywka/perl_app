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
      <div class="flex flex-col items-center justify-center gap-4">
        <!-- Круговой прогресс-бар с loading.svg -->
        <div class="relative flex items-center justify-center">
          <!-- Единственный прогресс круг -->
          <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="20"
              stroke="#11AE78"
              stroke-width="8"
              fill="none"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="strokeDashoffset"
              class="transition-all duration-1000 ease-linear"
            />
          </svg>
          
       
        </div>
        
        <img src="../assets/med-icon.svg" alt="med-icon" class="w-40 sm:w-52 lg:w-60 h-12 sm:h-14 lg:h-16" />
        <img src="../assets/yandex.svg" alt="dost" class="w-40 sm:w-52 lg:w-60 h-12 sm:h-14 lg:h-16 my-2" />
        <div class="text-center text-sm sm:text-base lg:text-lg font-bold  leading-tight my-3 sm:my-4">
          Чтобы узнать как заказать <br/> такой терминал, <br/> отсканируйте QR-код
        </div>
        
       
        
        <img src="../assets/qr.svg" alt="qr" class="w-24 sm:w-28 lg:w-32 h-24 sm:h-28 lg:h-32" />
        
        <a 
          href="http://medcontact.ai" 
          target="_blank"
          class="text-green-700 font-bold text-sm hover:text-green-800 transition-colors mb-6"
        >
        <span class="text-green-700 font-bold text-sm sm:text-base lg:text-lg hover:text-green-800 transition-colors">
          http://medcontact.ai
        </span>
        </a>
        
        <nav class="flex justify-between items-center bg-[#E8F4F2] h-16 sm:h-16 lg:h-20 w-full">
        <!-- Кнопка закрытия -->
        <div 
          @click="closeModal" 
          class=" m-auto px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-white border-2 border-[#11AE78] text-[#11AE78] font-medium hover:bg-green-50 transition-all duration-300 transform hover:scale-105 cursor-pointer text-sm sm:text-base"
        >
          Закрыть ×
        </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSoundControl } from '../composables/useSoundControl'

const { enableSound } = useSoundControl()


// Props
const props = defineProps<{
  isVisible: boolean
}>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// Таймер обратного отсчета
const countdown = ref(10)
const totalTime = 10
let countdownInterval: number | null = null

// Вычисляемые свойства для кругового прогресса
const circumference = computed(() => 2 * Math.PI * 20) // радиус 20
const strokeDashoffset = computed(() => {
  const progress = (totalTime - countdown.value) / totalTime
  return circumference.value * (1 - progress)
})

const closeModal = () => {
  stopCountdown()
  emit('close')
}

const startCountdown = () => {
  countdown.value = 10
  
  // Очищаем предыдущий таймер если есть
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  
  countdownInterval = window.setInterval(() => {
    countdown.value--
    
    if (countdown.value <= 0) {
      // Таймер истек - сбрасываем звук и закрываем модалку
      enableSound()
 
      stopCountdown()
      emit('close')
      // Убираем router.push - навигация должна управляться родительским компонентом
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

// Закрытие по Escape
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  stopCountdown()
  document.removeEventListener('keydown', handleKeydown)
})
</script>