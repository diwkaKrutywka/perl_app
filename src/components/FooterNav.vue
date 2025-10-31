<template>
    <div class="">
      <!-- QR-кнопка (относительно всей страницы, а не футера) -->
      <div
        v-if="props.showQR"
        class="fixed bottom-[50px] md:bottom-[75px] 4k:bottom-[120px] 4k-plus:bottom-[140px] right-2 4k:right-6 4k-plus:right-8 z-10 bg-[#005F62] rounded-t-[40px] px-4 4k:px-5 4k-plus:px-6 py-6 4k:py-8 4k-plus:py-10 cursor-pointer transition-all duration-300 shadow-lg qr-animate w-auto"
        @click="handleQRClick"
      >
        <div class="flex flex-col items-center text-white">
          <span
            class="text-xs xs:text-sm 4k:text-base 4k-plus:text-lg font-base mb-1 leading-tight text-center"
            v-html="$t('qr_button_text')"
          >
          </span>
          <img
            src="../assets/bx_qr.svg"
            alt="QR code"
            class="w-8 h-8 sm:w-10 sm:h-10 4k:w-12 4k:h-12 4k-plus:w-16 4k-plus:h-16"
          />
        </div>
      </div>
  
      <!-- Основной футер -->
      <div
        class="fixed bottom-0 left-0 bg-[#E8F4F2] h-16 sm:h-18 lg:h-20 4k:h-24 4k-plus:h-28 flex items-center justify-between shadow-sm w-full z-20"
        style="border-top-left-radius: 0; border-top-right-radius: 30px;"
      >
        <!-- Левая часть футера -->
        <div class="flex items-center flex-1">
          <!-- Поиск -->
          <div v-if="props.showSearch" class="w-80 sm:w-96 lg:w-80 4k:w-96 4k-plus:w-[28rem] ml-4 4k:ml-6 4k-plus:ml-8 my-4 4k:my-5 4k-plus:my-6">
            <div class="relative">
              <input
                type="text"
                :placeholder="$t('search_placeholder')"
                @click="goToSearch"
                class="w-full px-3 sm:px-4 4k:px-6 4k-plus:px-8 py-1.5 sm:py-2 4k:py-3 4k-plus:py-4 pl-3 sm:pl-4 4k:pl-6 4k-plus:pl-8 pr-8 sm:pr-10 4k:pr-12 4k-plus:pr-16 text-sm sm:text-base lg:text-lg 4k:text-xl 4k-plus:text-2xl border-2 border-[#11AE78] bg-white rounded-xl sm:rounded-[14px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer placeholder-gray-500 search-input"
                readonly
              />
              <div
                class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              >
                <svg
                  class="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 4k:h-6 4k:w-6 4k-plus:h-8 4k-plus:w-8 text-green-700 font-extrabold"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
          <!-- Кнопка Назад -->
          <div
            v-if="props.showBackButton"
            @click="goBack"
            class="border-2 border-[#11AE78] bg-gradient-to-r from-[#14865E] to-[#11AE78] hover:from-[#117A52] hover:to-[#0E9A6A] flex items-center justify-center text-white px-4 4k:px-6 4k-plus:px-8 py-2.5 4k:py-3 4k-plus:py-4 rounded-full ml-4 4k:ml-6 4k-plus:ml-8 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="white"
              class="size-4 4k:size-6 4k-plus:size-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            <span
              class="flex text-white items-center justify-center ml-2 my-auto mb-0 font-semibold text-sm sm:text-base lg:text-lg 4k:text-xl 4k-plus:text-2xl"
              >{{ $t("back_button") }}</span
            >
          </div>
  
          <!-- Кнопка Главная -->
          <div
            v-if="props.showHomeButton"
            @click="goHome"
            class="flex bg-white items-center ml-6 4k:ml-8 4k-plus:ml-10 justify-center px-4 4k:px-6 4k-plus:px-8 py-2.5 4k:py-3 4k-plus:py-4 rounded-full cursor-pointer text-[#11AE78] font-semibold text-xs sm:text-sm lg:text-base 4k:text-lg 4k-plus:text-xl border-2 border-[#11AE78] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <span
              class="flex items-center justify-center ml-2 my-auto mb-0 font-semibold text-sm sm:text-base lg:text-lg 4k:text-xl 4k-plus:text-2xl"
              >{{ $t("home_button") }}</span
            >
          </div>
  
          <!-- Кнопка Чат -->
          <div
            v-if="props.showChat"
            @click="goToChat"
            class="flex bg-white items-center ml-6 4k:ml-8 4k-plus:ml-10 justify-center px-4 4k:px-6 4k-plus:px-8 py-2.5 4k:py-3 4k-plus:py-4 rounded-full cursor-pointer text-[#11AE78] font-semibold text-xs sm:text-sm lg:text-base 4k:text-lg 4k-plus:text-xl border-2 border-[#11AE78] transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <img src="../assets/chat.svg" alt="chat" class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 4k:w-8 4k:h-8 4k-plus:w-10 4k-plus:h-10 mr-2" />
            <span
              class="flex items-center justify-center my-auto mb-0 font-semibold text-sm sm:text-base lg:text-lg 4k:text-xl 4k-plus:text-2xl"
              >{{ $t("ask_aigerim") }}</span
            >
          </div>
        </div>
  
        <!-- Правая часть футера -->
        <div
          class="w-auto min-w-[180px] 4k:min-w-[220px] 4k-plus:min-w-[260px] bg-gradient-to-r from-[#14865E] to-[#11AE78] h-full rounded-tl-[22px] flex items-center justify-center gap-3 sm:gap-4 4k:gap-6 4k-plus:gap-8 px-5 sm:px-7 4k:px-12 4k-plus:px-14"
        >
          <!-- Кнопка языка -->
          <div
            v-if="props.showLanguageButton"
            class="w-12 h-12 4k:w-16 4k:h-16 4k-plus:w-20 4k-plus:h-20 rounded-full bg-white flex items-center justify-center shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105"
            @click="toggleLanguage"
          >
            <span class="text-[#14865E] text-base 4k:text-lg 4k-plus:text-xl font-bold">
              {{ currentLanguage === "kk" ? $t("language_rus") : $t("language_kaz") }}
            </span>
          </div>
  
          <!-- Кнопка звука -->
          <div
            class="w-12 h-12 4k:w-16 4k:h-16 4k-plus:w-20 4k-plus:h-20 rounded-full bg-white flex items-center justify-center shadow-md cursor-pointer transition-all duration-300 transform hover:scale-105"
            @click="toggleSound"
          >
            <img :src="soundIcon" alt="sound" :class="soundIconClass" />
          </div>
        </div>
      </div>
      
      <!-- Модалка StaticAd -->
      <StaticAd 
        v-if="showStaticAd"
        :isVisible="showStaticAd" 
        @close="closeStaticAd" 
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from "vue";
  import { useRouter } from "vue-router";
  import { useI18n } from "vue-i18n";
  import { useSoundControl } from "../composables/useSoundControl.ts";
  import StaticAd from "../components/StaticAd.vue";
  
  interface Props {
    showHomeButton?: boolean;
    showQR?: boolean;
    showChat?: boolean;
    showSearch?: boolean;
    showBackButton?: boolean;
    showLanguageButton?: boolean;
  }
  
  const props = withDefaults(defineProps<Props>(), {
    showHomeButton: false,
    showQR: true,
    showChat: false,
    showSearch: false,
    showBackButton: true,
    showLanguageButton: true,
  });
  
  const router = useRouter();
  const { locale } = useI18n();
  const { toggleSound, soundIcon, soundIconClass } = useSoundControl();
  
  // Состояние для модалки StaticAd
  const showStaticAd = ref(false);
  
  // Вычисляемое свойство для текущего языка
  const currentLanguage = computed(() => locale.value);
  
  onMounted(() => {
    const savedLanguage = localStorage.getItem("currentLang");
    if (savedLanguage && (savedLanguage === "ru" || savedLanguage === "kk")) {
      locale.value = savedLanguage;
    }
  });
  
  const goBack = () => {
    try {
      if (router.currentRoute.value.name === "ServiceView" || router.currentRoute.value.name === "SearchPage" || router.currentRoute.value.name === "InfoService") {
        sessionStorage.setItem("shouldReturnAnimate", "true");
        router.push("/home").then(() => {
          setTimeout(() => {
            if ((window as any).startReturnAnimation) {
              (window as any).startReturnAnimation();
            }
          }, 200);
        }).catch(() => {
          // Обработка ошибки перехода
        });
      } else {
        router.back();
      }
    } catch {
      // Обработка ошибки
    }
  };
  
  const goHome = () => {
    try {
      router.push("/home");
    } catch {
      // Обработка ошибки
    }
  };
  
  const goToChat = () => {
    router.push("/chat");
  };
  
  const goToSearch = () => {
    // Запускаем глобальную анимацию для перехода на SearchPage
    (window as any).startVideoTransition();
    
    // Переходим на страницу через небольшую задержку
    setTimeout(() => {
      router.push("/search");
    }, 100);
  };
  
  const toggleLanguage = () => {
    try {
      const newLocale = currentLanguage.value === "ru" ? "kk" : "ru";
      
      // Сохраняем в localStorage
      localStorage.setItem("currentLang", newLocale);
      
      // Обновляем реактивную локализацию
      locale.value = newLocale;
      
    } catch (error) {
      // Обработка ошибки переключения языка
    }
  };
  
  const handleQRClick = () => {
   showStaticAd.value = true;
  };
  
  const closeStaticAd = () => {
   showStaticAd.value = false;
  };
  </script>
  
  <style scoped>
  @keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(17,174,120,0.9); }
    70% { transform: scale(1.05); box-shadow: 0 0 18px 6px rgba(17,174,120,0.6); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(17,174,120,0); }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-4px); }
    60% { transform: translateY(-2px); }
  }
  
  .qr-animate {
    animation: pulse 2s infinite, bounce 3s infinite;
    border-radius: 35% 35% 0 0;
  }
  
  /* Стили для placeholder в поле поиска */
  input[readonly]::placeholder {
    color: #6B7280 !important;
    opacity: 1 !important;
    font-weight: normal !important;
  }
  
  input[readonly]:focus::placeholder {
    color: #9CA3AF !important;
  }
  
  /* Стили для вводимого текста */
  input[readonly] {
    color: #000000 !important;
    font-weight: bold !important;
  }
  
  input[readonly]:focus {
    color: #000000 !important;
  }
  
  /* Специальные стили для поля поиска */
  .search-input {
    text-indent: 0 !important;
    color: #000 !important;
  }
  
  .search-input::placeholder {
    text-indent: 0 !important;
    padding-left: 0 !important;
  }
  
  /* Когда есть текст, добавляем отступ */
  .search-input:not(:placeholder-shown) {
    padding-left: 2rem !important;
  }
  
  @media (min-width: 640px) {
    .search-input:not(:placeholder-shown) {
      padding-left: 2.5rem !important;
    }
  }
  </style>