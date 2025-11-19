<template>
  <div class="h-screen bg-gradient-to-b from-[#E8F4F2] to-white flex flex-col w-full">

    <!-- Видео в правом верху (скрыто во время глобальной анимации) -->
    <div
      class="info-video-container fixed z-50"
      :class="{ 'hidden-during-animation': isGlobalAnimating }"
      :style="{ top: '0.5rem', right: '1rem' }"
    >
      <UnifiedVideo 
        position="top-right" 
        :enable-rotation="true"
        instance-id="info-service-top-right"
        page-type="infoService"
      />
    </div>
    <!-- Основной контент -->
    <main class="flex-1 relative flex flex-col bg-white px-2 sm:px-4 py-4 sm:py-6 overflow-y-auto">
      <!-- Иконка помощи -->
      <div class="flex justify-center my-6 sm:my-8 lg:my-10 mt-18">
       <img src="../assets/ask.svg" alt="info-service" class="w-25 h-25 sm:w-28 sm:h-28 lg:w-28 lg:h-28 xl:w-32 xl:h-32 mt-18"></img>
      </div>

      <!-- Заголовок -->
      <p class="text-[#11AE78] font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-center mb-6 sm:mb-8 px-2">
        {{ $t('service_info') }}
      </p>

      <!-- Список вопросов FAQ -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <a-spin size="large" />
      </div>
      <div v-else class="space-y-2 sm:space-y-3 mb-6 sm:mb-8 mx-2 sm:mx-4 lg:mx-6">
        <div 
          v-for="faq in faqList" 
          :key="faq.id"
          @click="selectFaq(faq.id)"
          class="bg-gradient-to-r from-[#11AE78] to-[#14865E] hover:from-[#0E9A6A] hover:to-[#0C593E] text-white font-bold py-3 sm:py-4 details px-4 sm:px-6 rounded-[16px] sm:rounded-[20px] cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-between"
        >
          <span class="text-xs sm:text-xs md:text-sm lg:text-md">{{ faq.question }}</span>
          <svg class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
      
    </main>

      <!-- Фиксированный футер -->
     
      <div class=" left-0 right-0 z-40 bg-[#E8F4F2]">

 
  
      <FooterNav :showHomeButton="true" :showBackButton="true" :showLanguageButton="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import FooterNav from "../components/FooterNav.vue";
import UnifiedVideo from "../components/UnifiedVideo.vue";
import { useI18n } from "vue-i18n";
import { ref, onMounted, watch } from "vue";
import { getFaqByLanguage, type FAQItem } from "../api/faq";

const router = useRouter();
const { t: $t, locale } = useI18n();

// Состояние глобальной анимации
const isGlobalAnimating = ref(true); // Начинаем со скрытого состояния

// Данные FAQ
const faqList = ref<FAQItem[]>([]);
const loading = ref(false);

// Функция для загрузки FAQ
const fetchFaq = async () => {
  loading.value = true;
  try {
    const language = locale.value === 'ru' ? 'ru' : (locale.value === 'kk' ? 'kk' : 'en');
    const data = await getFaqByLanguage(language);
    faqList.value = data;
  } catch (error) {
    console.error('Failed to fetch FAQ:', error);
    faqList.value = [];
  } finally {
    loading.value = false;
  }
};

// Функция навигации к деталям вопроса
const selectFaq = (faqId: string) => {
  router.push(`/info-details/${faqId}`);
};

// Отслеживаем изменения языка и обновляем FAQ
watch(() => locale.value, () => {
  fetchFaq();
}, { immediate: false });

// Показываем локальное видео после исчезновения глобального
onMounted(() => {
  // Загружаем FAQ при монтировании
  fetchFaq();
  
  setTimeout(() => {
    isGlobalAnimating.value = false;
  }, 1200); // Появляется почти одновременно с исчезновением глобального

  // Дополнительная гарантия скрытия глобального видео
  setTimeout(() => {
    (window as any).forceHideGlobalVideo?.();
  }, 1400); // Двойная гарантия
});

</script>

<style scoped>
.hidden-during-animation {
  opacity: 0;
  visibility: hidden;
}

.info-video-container {
  transition: opacity 0.1s ease-in-out, visibility 0.1s ease-in-out;
}

.info-video-container:not(.hidden-during-animation) {
  opacity: 1;
  visibility: visible;
}
</style>