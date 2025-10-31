<template>
  <div class="w-full h-full bg-[#E8F4F2] flex flex-col overflow-hidden m-0 p-0">

    <main
      class="flex-1 flex flex-col items-center justify-center px-4 4k:px-8 4k-plus:px-12 py-2 sm:py-4 4k:py-6 4k-plus:py-8 bg-white"
    >
      <!-- Заголовки -->
      <div class="text-center mb-4 sm:mb-6 4k:mb-8 4k-plus:mb-10">
        <div
          class="text-[#11AE78] font-bold text-2xl sm:text-2xl lg:text-3xl 4k:text-4xl 4k-plus:text-5xl mb-1 sm:mb-2 4k:mb-3 4k-plus:mb-4 leading-tight"
          v-html="$t('choose_service')"
        ></div>
      </div>

      <!-- Видео контейнер -->
      <div class="mb-4 sm:mb-6 4k:mb-8 4k-plus:mb-10">
        <div 
          class="video-container"
          :class="{ 'hide-video': isAnimating }"
        >
          <UnifiedVideo 
            position="center" 
            :enable-rotation="true"
            instance-id="home-center"
            page-type="home"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2 4k:gap-4 4k-plus:gap-6 w-full max-w-2xl 4k:max-w-lg 4k-plus:max-w-xl">
        <!-- Первая строка кнопок -->
        <div class="flex gap-4 4k:gap-6 4k-plus:gap-8">
          <div
            @click="selectService('appointment')"
            class="flex-1 min-w-60 bg-gradient-to-r from-[#0C593E] to-[#14865E] hover:from-[#0A4A33] hover:to-[#117A52] text-white font-bold py-2 sm:py-3 lg:py-4 4k:py-6 4k-plus:py-8 px-2 sm:px-4 lg:px-6 4k:px-8 4k-plus:px-10 rounded-xl sm:rounded-2xl text-base sm:text-xl lg:text-2xl 4k:text-3xl 4k-plus:text-4xl cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div class="flex flex-col items-start gap-1">
              <img
                src="../assets/appointment.svg"
                alt="appointment"
                class="w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 4k:w-10 4k:h-10 4k-plus:w-12 4k-plus:h-12"
              />
              <p class="text-start text-base sm:text-lg lg:text-xl 4k:text-2xl 4k-plus:text-3xl mb-0" v-html="$t('make_appointment')"></p>
            </div>
          </div>
          <div
            @click="selectService('help')"
            class="flex-1 min-w-60 bg-gradient-to-r from-[#14865E] to-[#11AE78] hover:from-[#117A52] hover:to-[#0E9A6A] text-white font-bold py-2 sm:py-3 lg:py-4 4k:py-6 4k-plus:py-8 px-2 sm:px-4 lg:px-6 4k:px-8 4k-plus:px-10 rounded-xl sm:rounded-2xl text-base sm:text-xl lg:text-2xl 4k:text-3xl 4k-plus:text-4xl cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div class="flex flex-col items-start gap-1">
              <img src="../assets/help.svg" alt="help" class="w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 4k:w-10 4k:h-10 4k-plus:w-12 4k-plus:h-12" />
              <p class="text-start text-base sm:text-lg lg:text-xl 4k:text-2xl 4k-plus:text-3xl mb-0"  v-html="$t('help_center')"></p>
            </div>
          </div>
        </div>

       
      </div>
    </main>

    <!-- Нижняя навигация -->
    <FooterNav :show-search="true" :show-back-button="false" :showLanguageButton="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import FooterNav from "../components/FooterNav.vue";
import UnifiedVideo from "../components/UnifiedVideo.vue";

const router = useRouter();
const route = useRoute();
const { locale } = useI18n();



// Простая проверка и синхронизация языка
const currentLang = localStorage.getItem('currentLang') || 'kk';

// Если языки не совпадают, принудительно устанавливаем правильный
if (locale.value !== currentLang) {
  locale.value = currentLang;
}

// Состояние анимации видео - скрываем видео если есть флаг анимации
const isAnimating = ref(false);


// Функция для запуска анимации возврата
const startReturnAnimation = () => {
  // Функция для поиска контейнера с повторными попытками
  const findAndAnimateContainer = (attempts = 0) => {
    const videoContainer = document.querySelector('.video-container');
    
    if (videoContainer) {
      // Добавляем класс анимации к видео контейнеру
      videoContainer.classList.add('return-animation');
      
      // Убираем класс анимации после завершения
      setTimeout(() => {
        videoContainer.classList.remove('return-animation');
        isAnimating.value = false; // Показываем видео в центре
      }, 1500);
    } else if (attempts < 10) {
      // Повторяем попытку через 100ms, максимум 10 попыток
      setTimeout(() => findAndAnimateContainer(attempts + 1), 100);
    }
  };
  
  // Начинаем поиск сразу
  findAndAnimateContainer();
};

// Глобальная функция для запуска анимации возврата
(window as any).startReturnAnimation = startReturnAnimation;

// Принудительная синхронизация языка при монтировании
onMounted(async () => {
  const savedLang = localStorage.getItem('currentLang') || 'kk';
  
  // Устанавливаем язык если он отличается
  if (locale.value !== savedLang) {
    locale.value = savedLang;
  }
});

// Отслеживаем изменения языка
watch(() => locale.value, () => {
  // Синхронизация языка
});

// Отслеживаем возврат на HomeView для анимации
watch(route, (newRoute) => {
  if (newRoute.name === 'HomeView') {
    // Проверяем, нужно ли запустить анимацию возврата
    if (sessionStorage.getItem('shouldReturnAnimate') === 'true') {
      sessionStorage.removeItem('shouldReturnAnimate');
      // Скрываем видео перед анимацией
      isAnimating.value = true;
      // Запускаем анимацию сразу
      startReturnAnimation();
    } else {
      // Если анимации нет, показываем видео сразу
      isAnimating.value = false;
    }
  }
});

onUnmounted(() => {
  // Очистка интервала теперь происходит в useDateTime composable
});

const selectService = (service: string) => {
 if (service === "appointment") {
    // Скрываем локальное видео и запускаем глобальную анимацию
    isAnimating.value = true;
    (window as any).startVideoTransition();
    
    // Переходим на страницу через небольшую задержку
    setTimeout(() => {
      router.push("/service");
    }, 100);
  }
  else if (service === "help") {
    // Скрываем локальное видео и запускаем глобальную анимацию
    isAnimating.value = true;
    (window as any).startVideoTransition();
    
    // Переходим на страницу через небольшую задержку
    setTimeout(() => {
      router.push("/info-service");
    }, 100);
  }
};

</script>

<style scoped>
/* Скрытие локального видео при анимации */
.hide-video {
  opacity: 0;
  transition: opacity 0.1s ease-out;
}

/* Простая анимация возврата видео */
.return-animation {
  animation: returnFromService 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* Начальное состояние для анимации возврата */
.video-container.return-animation {
  opacity: 0;
}

@keyframes returnFromService {
  0% {
    transform: translate(400px, -400px) scale(0.05);
    opacity: 0;
  }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
}

/* Градиентный бордер */
.gradient-border {
  position: relative;
}

.gradient-border::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: linear-gradient(45deg, #11AE78, #E8F4F2, #11AE78);
  border-radius: 50%;
  z-index: -1;
}
</style>
