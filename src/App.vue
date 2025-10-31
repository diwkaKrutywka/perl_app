<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import TopNav from "./components/TopNav.vue";
import { useI18n } from "vue-i18n";
import { ConfigProvider } from "ant-design-vue";
import ruRU from "ant-design-vue/es/locale/ru_RU";
import kkKZ from "ant-design-vue/es/locale/kk_KZ";
import enUS from "ant-design-vue/es/locale/en_US";
import { useUserStore } from "./store/index";
import Advertisement from "./components/Advertisement.vue";
import { videoAssets } from "./assets/videoImports.ts";
import { useInactivityTimer } from "./composables/useInactivityTimer.ts";

const { locale } = useI18n();
const userStore = useUserStore();
// Локали для Ant Design
const antdLocales = {
  ru: ruRU,
  kk: kkKZ,
  en: enUS,
};

// Текущая локаль для Ant Design
const currentAntdLocale = computed(() => {
  return antdLocales[locale.value as keyof typeof antdLocales] || ruRU;
});

// Управление модальным окном рекламы
const showAdvertisement = ref(false);

// Таймер бездействия - 30 секунд
const { isInactive, resetTimer } = useInactivityTimer(30000);

// Состояние глобального видео
const route = useRoute();
const router = useRouter();
const isVideoTransitioning = ref(false);
const showGlobalVideo = ref(false);
const idleVideoSrc = videoAssets.idle;

// Глобальные функции для управления модалкой из компонентов
(window as any).showInactivityModal = () => {
  showAdvertisement.value = true;
};
(window as any).hideInactivityModal = () => {
  showAdvertisement.value = false;
};

// Закрытие модального окна рекламы
const closeAdvertisement = () => {
  showAdvertisement.value = false;
  // Сбрасываем таймер бездействия при закрытии модалки
  resetTimer();
  // Уведомляем ChatView о закрытии модалки
  (window as any).onInactivityModalClosed?.();
  
  // Перенаправляем на главную страницу при закрытии модалки
  // Это обеспечивает возврат на MainView после таймаута
  const currentRoute = route.name;
  if (currentRoute !== 'MainView') {
    // Используем setTimeout для избежания конфликтов с текущей навигацией
    setTimeout(() => {
      userStore.clearIin()
      router.push('/');
    }, 100);
  }
};

// Функция для проверки наличия открытых модальных окон Ant Design
const hasOpenModals = () => {
  // Проверяем наличие элементов с классами модальных окон Ant Design
  const modalElements = document.querySelectorAll('.ant-modal-mask, .ant-modal-wrap');
  return modalElements.length > 0;
};

// Периодическая проверка модальных окон для более надежного отслеживания
let modalCheckInterval: number | null = null;

onMounted(() => {
  // Запускаем периодическую проверку каждые 500мс
  modalCheckInterval = window.setInterval(() => {
    if (showAdvertisement.value && hasOpenModals()) {
      showAdvertisement.value = false;
    }
  }, 500);
});

onUnmounted(() => {
  if (modalCheckInterval) {
    clearInterval(modalCheckInterval);
  }
});

// Отслеживаем бездействие и показываем модалку (кроме MainView, LoginPage и ChatView)
watch(
  [isInactive, route],
  ([inactive, currentRoute]) => {
    // Показываем модалку только если:
    // 1. Пользователь бездействует
    // 2. Не находимся на MainView, LoginPage или ChatView
    // 3. Модалка еще не показана
    // 4. Нет открытых модальных окон Ant Design
    const excludedPages = ["MainView", "LoginPage", "ChatView"];
    if (
      inactive &&
      !excludedPages.includes(currentRoute.name as string) &&
      !showAdvertisement.value &&
      !hasOpenModals()
    ) {
      showAdvertisement.value = true;
    }
  },
  { immediate: true }
);

// Глобальные функции для управления видео анимацией
(window as any).startVideoTransition = () => {
  showGlobalVideo.value = true;
  isVideoTransitioning.value = true;

  // Аварийное скрытие через максимальное время
  setTimeout(() => {
    if (showGlobalVideo.value) {
      showGlobalVideo.value = false;
      isVideoTransitioning.value = false;
    }
  }, 2000); // Максимум 2 секунды
};

// Функция для принудительного скрытия глобального видео
(window as any).forceHideGlobalVideo = () => {
  showGlobalVideo.value = false;
  isVideoTransitioning.value = false;
};

// Дополнительная защита - скрываем видео при любом взаимодействии
const hideVideoOnInteraction = () => {
  if (showGlobalVideo.value && route.name === "ServiceView") {
    showGlobalVideo.value = false;
    isVideoTransitioning.value = false;
  }
};

// Добавляем обработчики событий для принудительного скрытия
onMounted(() => {
  document.addEventListener("click", hideVideoOnInteraction);
  document.addEventListener("touchstart", hideVideoOnInteraction);
});

onUnmounted(() => {
  document.removeEventListener("click", hideVideoOnInteraction);
  document.removeEventListener("touchstart", hideVideoOnInteraction);
});

// Отслеживаем изменения маршрута
watch(route, (newRoute) => {
  if (
    (newRoute.name === "ServiceView" ||
      newRoute.name === "SearchPage" ||
      newRoute.name === "InfoService") &&
    isVideoTransitioning.value
  ) {
    // ПРИНУДИТЕЛЬНО скрываем глобальное видео сразу после анимации
    setTimeout(() => {
      showGlobalVideo.value = false;
      isVideoTransitioning.value = false;
    }, 1250); // Убираем сразу после анимации (1.2s + 50ms)
  }
});
</script>

<template>
  <ConfigProvider :locale="currentAntdLocale">
    <div class="w-screen h-screen overflow-hidden flex justify-center bg-white">
      <TopNav />
<div class="bg-white flex-1 w-full">
        <router-view />
      </div>
      
      <!-- <FooterNav /> -->
      <!-- Глобальное анимированное видео -->
      <div
        v-if="showGlobalVideo"
        class="global-video-container"
        :class="{ 'animate-to-service': isVideoTransitioning }"
      >
        <div class="global-video-wrapper">
          <video
            autoplay
            muted
            loop
            class="object-cover"
            style="
              width: 105%;
              height: 105%;
              margin: -2.5% 0 0 -2.5%;
              object-fit: cover;
              object-position: center;
              filter: contrast(1.1) brightness(1.05) saturate(1.1) sharpen(0.5);
            "
            :src="idleVideoSrc"
          ></video>
        </div>
      </div>

      <!-- Модальное окно рекламы -->
      <Advertisement
        :isVisible="showAdvertisement"
        @close="closeAdvertisement"
      />
    </div>
  </ConfigProvider>
</template>

<style scoped></style>

<style>
/* Глобальные стили для полноэкранного режима */
html,
body {
  margin: 0;
  font-family: "Onest", system-ui, -apple-system, sans-serif;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #e8f4f2; /* Фон для навигации и футера */
}

#app {
  overflow: hidden;
  padding: 0;
  display: flex;
  justify-content: center;
  background: #e8f4f2; /* Фон для навигации и футера */
}

/* Контейнер для контента */
.content-container {
  width: 100%;

  height: 100vh;

  background: white; /* Белый фон для контента */
}

/* Предотвращаем скролл на мобильных устройствах */
* {
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
}

/* Убираем стандартные отступы браузера */
body {
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}

/* Адаптивность для разных экранов */
@media (max-width: 448px) {
  .content-container {
    max-width: 100%;
  }
}

/* Убираем все возможные отступы и устанавливаем Onest для всех элементов */
* {
  box-sizing: border-box;
  font-family: "Onest", system-ui, -apple-system, sans-serif;
}

/* Увеличение базового размера шрифта для 4K экранов */
@media (min-width: 2560px), (min-height: 1440px) {
  html {
    font-size: 20px !important; /* Умеренное увеличение базового размера */
  }

  /* Умеренное увеличение текстовых элементов */
  .text-xl {
    font-size: 1.75rem !important;
  }
  .text-2xl {
    font-size: 2.25rem !important;
  }
  .text-3xl {
    font-size: 3rem !important;
  }
  .text-lg {
    font-size: 2rem !important;
  }
  .text-base {
    font-size: 1.5rem !important;
  }
  .text-sm {
    font-size: 1.125rem !important;
  }

  /* Увеличение кнопок и отступов */
  .py-2.rounded-full.shadow-lg {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
    font-size: 1.5rem !important;
    padding-left: 6rem !important;
    padding-right: 6rem !important;
  }
  .py-2.cursor-pointer {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
    font-size: 1.5rem !important;
    padding: 1.5rem 1rem !important;
  }
  .py-2.cursor-pointer.relative {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
    font-size: 1.5rem !important;
    
  }
  .py-3 {
    padding-top: 1.25rem !important;
    padding-bottom: 1.25rem !important;
  }
  .py-4 {
    padding-top: 1.5rem !important;
    padding-bottom: 1.5rem !important;
  }
  .px-4 {
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
  }
  .px-6 {
    padding-left: 2rem !important;
    padding-right: 2rem !important;
  }
  .px-8 {
    font-size: 1.5rem !important;
    padding-left:6rem !important;
    padding-right:6rem !important;
  }
}

@media (min-width: 3840px), (min-height: 2160px) {
  html {
    font-size: 24px !important; /* Умеренное увеличение для 4K+ */
  }

  /* Умеренное увеличение для 4K+ */
  .text-xl {
    font-size: 2rem !important;
  }
  .text-2xl {
    font-size: 2.5rem !important;
  }
  .text-3xl {
    font-size: 3.5rem !important;
  }
  .text-lg {
    font-size: 1.75rem !important;
  }
  .text-base {
    font-size: 1.5rem !important;
  }
  .text-sm {
    font-size: 1.25rem !important;
  }

  /* Максимальные кнопки и отступы */
  .py-2 {
    padding-top: 1.25rem !important;
    padding-bottom: 1.25rem !important;
  }
  .py-3 {
    padding-top: 1.5rem !important;
    padding-bottom: 1.5rem !important;
  }
  .py-4 {
    padding-top: 1.75rem !important;
    padding-bottom: 1.75rem !important;
  }
  .px-4 {
    padding-left: 2rem !important;
    padding-right: 2rem !important;
  }
  .px-6 {
    padding-left: 2.5rem !important;
    padding-right: 2.5rem !important;
  }
  .px-8 {
    padding-left: 3rem !important;
    padding-right: 3rem !important;
  }
}

/* Специальные стили для конкретных элементов на 4K */
@media (min-width: 2560px), (min-height: 1440px) {
  /* Время и дата в шапке */
  .text-\[#11AE78\] {
    font-size: 1.75rem !important;
  }
  .text-\[#14865E\] {
    font-size: 1.5rem !important;
  }
  .px-4.details {
    border-radius: 1.5rem !important;
    font-size: 2rem !important;
  }
  /* Заголовки */
  .text-green-700.text-xs {
    font-size: 1.2rem !important;
  }
  .text-\[#11AE78\].font-bold {
    font-size: 2rem !important;
  }
  .text-green-700.font-bold {
    font-size: 1rem !important;
  }
  .px-6 {
    border-radius: 1.5rem 1.5rem 0 0 !important;
  }

  .approve-btn{

    border-radius: 2.5rem !important;
  }
  .py-2.cursor-pointer.red{
    padding: 1.5rem !important;
    margin-right: 20px !important;
    border-radius: 50% !important;
    height: 100px !important;
    width: 120px !important;
  }
  .specialty-button {
    border-radius: 1.5rem !important;
  }
  /* Кнопки */
  .bg-\[#0C593E\] {
    font-size: 1.25rem !important;
    padding: 0.75rem 1.5rem !important;
  }
  .px-4.shadow-sm {
    border-radius: 0 !important;
  }
  .text-xl{
    font-size: 2rem !important;
  }
  .px-4.bg-white {
    border-radius: 0 !important;
  }
  .px-4.bg-white.cursor-pointer {
        border-radius: 3rem !important;
    }
  .info-label {
    font-size: 1.2rem !important;
  }
  .info-value {
    font-size: 1.2rem !important;
  }
  .text-green-600 {
    font-size: 1rem !important;
  }
  .font-bold.text-md.pri{
    font-size: 1.5rem !important;
  }
  .text-sm.px-4 {
    font-size: 1rem !important;
  }
  .text-md.font-bold {
    font-size: 1.5rem !important;
  }
  .text-sm {
    font-size: 1.5rem !important;
    border-radius: 1.5rem !important;
  }
  .text-sm.mr-auto{
    font-size: 1.25rem !important;
    
  }
  .image {
    width: 4rem !important;
    height: 4rem !important;
  }
  .names.px-4 {
    font-size: 1rem !important;
    font-weight: 600 !important;
    border-radius: 0 !important;
  }
  .iin {
    min-width: 500px !important;
    border-radius: 2.5rem !important;
  }
  .font-bold.text-md {
    font-size: 2rem !important;
    
  }
  .font-bold.text-md.text-gray-600{
    font-size: 1.5rem !important;
  }
  .py-2.cursor-pointer.w-fit{
    padding: 0.7rem 1rem !important;
    font-size: 1.5rem !important;
  }
  .py-2.cursor-pointer.approve{
    padding:0 !important;
  }
  .font-medium.name{
  font-size: 1.2rem !important;
  font-weight: 700 !important;
}
.font-semibold.text-center.mb-2{
  font-size: 1.3rem !important;
}
  .font-semibold.text-center{
    font-size: 1rem !important;
  }
  .text-xs {
    font-size: 1.5rem !important;
  }
  .text-xs.text-gray-500{
    font-size: 1rem !important;
  }
  /* Таблицы */
  .text-sm.font-base {
    font-size: 1.3rem !important;
    font-weight: 600 !important;
  }
  .text-sm.font-semibold {
    font-size: 1.5rem !important;
  }
  .font-medium {
    font-size: 2rem !important;
  }
  .text-\[#666666\] {
    font-size: 0.875rem !important;
  }
  .text-\[#333333\] {
    font-size: 1rem !important;
  }
}

@media (min-width: 3840px), (min-height: 2160px) {
  /* Время и дата в шапке */
  .text-\[#11AE78\] {
    font-size: 2rem !important;
  }
  .text-\[#14865E\] {
    font-size: 1.75rem !important;
  }

  /* Заголовки */
  .text-\[#11AE78\].font-bold {
    font-size: 2.5rem !important;
  }
  .text-green-700.font-bold {
    font-size: 2.5rem !important;
  }

  /* Кнопки */
  .bg-\[#0C593E\] {
    font-size: 1.5rem !important;
    padding: 1rem 2rem !important;
  }

  /* Таблицы */
  .text-sm.font-semibold {
    font-size: 1.25rem !important;
  }
  .font-medium {
    font-size: 1.25rem !important;
  }
  .text-\[#666666\] {
    font-size: 1rem !important;
  }
  .text-\[#333333\] {
    font-size: 1.25rem !important;
  }
}

/* Универсальные стили для всех маленьких элементов на 4K */
@media (min-width: 2560px), (min-height: 1440px) {
  /* Умеренное увеличение для маленьких элементов */
  .text-xs {
    font-size: 0.875rem !important;
  }
  .text-\[10px\] {
    font-size: 0.75rem !important;
  }
  .text-\[12px\] {
    font-size: 0.875rem !important;
  }
  .text-\[14px\] {
    font-size: 1rem !important;
  }
  .text-\[16px\] {
    font-size: 1.125rem !important;
  }

  /* Умеренное увеличение кнопок */
  button,
  .btn,
  [role="button"] {
    font-size: 1rem !important;
    padding: 0.5rem 1rem !important;
  }

  /* Умеренное увеличение инпутов */
  input,
  textarea,
  select {
    font-size: 1rem !important;
    padding: 0.5rem !important;
  }

  /* Умеренное увеличение ссылок */
  a {
    font-size: 1rem !important;
  }

  /* Исключения для футера и мелких элементов */
  footer,
  .footer,
  nav,
  .nav {
    font-size: 0.875rem !important;
  }

  /* Мелкий текст в футере */
  .text-\[10px\],
  .text-xs {
    font-size: 1.25rem !important;
  }
  .text-xs.font-base {
    font-size: 0.75rem !important;
  }
}

@media (min-width: 3840px), (min-height: 2160px) {
  /* Умеренное увеличение для 4K+ */
  .text-xs {
    font-size: 1rem !important;
  }
  .text-\[10px\] {
    font-size: 0.875rem !important;
  }
  .text-\[12px\] {
    font-size: 1rem !important;
  }
  .text-\[14px\] {
    font-size: 1.125rem !important;
  }
  .text-\[16px\] {
    font-size: 1.25rem !important;
  }

  button,
  .btn,
  [role="button"] {
    font-size: 1.25rem !important;
    padding: 0.75rem 1.5rem !important;
  }

  input,
  textarea,
  select {
    font-size: 1.25rem !important;
    padding: 0.75rem !important;
  }

  a {
    font-size: 1.25rem !important;
  }

  /* Исключения для футера и мелких элементов */
  footer,
  .footer,
  nav,
  .nav {
    font-size: 1rem !important;
  }

  /* Мелкий текст в футере */
  .text-\[10px\],
  .text-xs {
    font-size: 0.875rem !important;
  }
}

/* Специальные стили для очень высоких экранов */
@media (min-height: 1800px) {
  html {
    font-size: 22px !important;
  }

  .text-xl {
    font-size: 1.875rem !important;
  }
  .text-2xl {
    font-size: 2.5rem !important;
  }
  .text-3xl {
    font-size: 3.5rem !important;
  }
  .text-lg {
    font-size: 1.625rem !important;
  }
  .text-base {
    font-size: 1.375rem !important;
  }
  .text-sm {
    font-size: 1.125rem !important;
  }

  button,
  .btn,
  [role="button"] {
    font-size: 1.125rem !important;
    padding: 0.75rem 1.5rem !important;
  }

  input,
  textarea,
  select {
    font-size: 1.125rem !important;
    padding: 0.75rem !important;
  }

  a {
    font-size: 1.125rem !important;
  }
}

/* Стили для ультрашироких мониторов */
@media (min-width: 3440px) {
  html {
    font-size: 22px !important;
  }

  .text-xl {
    font-size: 1.875rem !important;
  }
  .text-2xl {
    font-size: 2.5rem !important;
  }
  .text-3xl {
    font-size: 3.5rem !important;
  }
  .text-lg {
    font-size: 1.625rem !important;
  }
  .text-base {
    font-size: 1.375rem !important;
  }
  .text-sm {
    font-size: 1.125rem !important;
  }
}

/* Глобальное анимированное видео */
.global-video-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: none;
  /* Анимация будет переопределять эти значения */
}

.global-video-wrapper {
  width: 12.625rem; /* 202px */
  height: 12.625rem; /* 202px */
  border: 4px solid #e8f4f2;
  border-radius: 50%;
  overflow: hidden;
  background: transparent;
  box-shadow: 0 4px 20px rgba(17, 174, 120, 0.3);
  animation: pulse-glow 2s infinite;
}

/* Анимация перемещения в ServiceView */
.animate-to-service {
  animation: moveToServiceView 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)
    forwards;
  animation-fill-mode: forwards; /* Остается в финальной позиции */
}

.animate-to-service .global-video-wrapper {
  animation: shrinkToService 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards,
    pulse-glow 2s infinite;
  animation-fill-mode: forwards; /* Остается в финальном размере */
}

@keyframes moveToServiceView {
  0% {
    transform: translate(-50%, -50%);
  }
  100% {
    /* Точная настройка: -33px по X и Y для идеального совпадения */
    transform: translate(calc(50vw - 3rem - 37px), calc(-50vh + 2.5rem - 37px));
  }
}

@keyframes shrinkToService {
  0% {
    width: 12.625rem; /* 202px */
    height: 12.625rem; /* 202px */
    border: 4px solid #e8f4f2;
  }
  100% {
    width: calc(5rem + 10px); /* увеличенный размер */
    height: calc(5rem + 10px); /* увеличенный размер */
    border: 2px solid #c5e6dc;
  }
}

/* Адаптивность для глобального видео */
@media (min-width: 637px) {
  .global-video-wrapper {
    width: 11.625rem; /* 186px */
    height: 11.625rem; /* 186px */
  }

  @keyframes shrinkToService {
    0% {
      width: 11.625rem; /* 186px */
      height: 11.625rem; /* 186px */
      border: 4px solid #e8f4f2;
    }
    100% {
      width: calc(6rem + 10px); /* увеличенный размер для SM */
      height: calc(6rem + 10px); /* увеличенный размер для SM */
      border: 2px solid #c5e6dc;
    }
  }

  @keyframes moveToServiceView {
    0% {
      transform: translate(-50%, -50%);
    }
    100% {
      /* SM: Точная настройка: -37px по X и Y */
      transform: translate(
        calc(50vw - 3.5rem - 37px),
        calc(-50vh + 3rem - 37px)
      );
    }
  }
}

@media (min-width: 1024px) {
  .global-video-wrapper {
    width: 15.625rem; /* 250px */
    height: 15.625rem; /* 250px */
  }

  @keyframes shrinkToService {
    0% {
      width: 15.625rem; /* 250px */
      height: 15.625rem; /* 250px */
      border: 4px solid #e8f4f2;
    }
    100% {
      width: calc(7rem + 10px); /* увеличенный размер для LG */
      height: calc(7rem + 10px); /* увеличенный размер для LG */
      border: 2px solid #c5e6dc;
    }
  }

  @keyframes moveToServiceView {
    0% {
      transform: translate(-50%, -50%);
    }
    100% {
      /* LG: Точная настройка: -37px по X и Y */
      transform: translate(
        calc(50vw - 4rem - 37px),
        calc(-50vh + 3.5rem - 37px)
      );
    }
  }
}

@media (min-width: 1280px) {
  .global-video-wrapper {
    width: 17.125rem; /* 274px */
    height: 17.125rem; /* 274px */
  }

  @keyframes shrinkToService {
    0% {
      width: 17.125rem; /* 274px */
      height: 17.125rem; /* 274px */
      border: 4px solid #e8f4f2;
    }
    100% {
      width: calc(7rem + 10px); /* увеличенный размер для XL */
      height: calc(7rem + 10px); /* увеличенный размер для XL */
      border: 2px solid #c5e6dc;
    }
  }

  @keyframes moveToServiceView {
    0% {
      transform: translate(-50%, -50%);
    }
    100% {
      /* XL: Точная настройка: -35px по X и Y */
      transform: translate(
        calc(50vw - 4rem - 40px),
        calc(-50vh + 3.5rem - 40px)
      );
    }
  }
}

/* Поддержка 4K экранов (2560px и выше) */
@media (min-width: 2560px) {
  .global-video-wrapper {
    width: 22rem; /* 352px */
    height: 22rem; /* 352px */
  }

  @keyframes shrinkToService {
    0% {
      width: 22rem; /* 352px */
      height: 22rem; /* 352px */
      border: 6px solid #e8f4f2;
    }
    100% {
      width: calc(9rem + 15px); /* увеличенный размер для 4K */
      height: calc(9rem + 15px); /* увеличенный размер для 4K */
      border: 3px solid #c5e6dc;
    }
  }

  @keyframes moveToServiceView {
    0% {
      transform: translate(-50%, -50%);
    }
    100% {
      /* 4K: Точная настройка для больших экранов */
      transform: translate(calc(50vw - 5rem - 50px), calc(-50vh + 4rem - 50px));
    }
  }
}

/* Поддержка 4K экранов с высоким DPI */
@media (min-width: 3840px) {
  .global-video-wrapper {
    width: 28rem; /* 448px */
    height: 28rem; /* 448px */
  }

  @keyframes shrinkToService {
    0% {
      width: 28rem; /* 448px */
      height: 28rem; /* 448px */
      border: 8px solid #e8f4f2;
    }
    100% {
      width: calc(12rem + 20px); /* увеличенный размер для 4K+ */
      height: calc(12rem + 20px); /* увеличенный размер для 4K+ */
      border: 4px solid #c5e6dc;
    }
  }

  @keyframes moveToServiceView {
    0% {
      transform: translate(-50%, -50%);
    }
    100% {
      /* 4K+: Точная настройка для очень больших экранов */
      transform: translate(calc(50vw - 6rem - 60px), calc(-50vh + 5rem - 60px));
    }
  }
}

/* Анимация для видео */
.video-glow {
  box-shadow: 0 0 20px rgba(17, 174, 120, 0.3);
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(17, 174, 120, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(17, 174, 120, 0.5);
  }
}

/* Стили для модального окна ApprovePage */
.approve-modal .ant-modal-content {
  border-radius: 1rem !important;
  overflow: hidden !important;
}

/* Убеждаемся что скругление применяется на всех экранах */
@media (min-width: 2560px), (min-height: 1440px) {
  .approve-modal .ant-modal-content {
    border-radius: 1.5rem !important;
  }
}

@media (min-width: 3840px), (min-height: 2160px) {
  .approve-modal .ant-modal-content {
    border-radius: 2rem !important;
  }
}
</style>
