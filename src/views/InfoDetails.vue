<template>
    <div class="h-screen bg-gradient-to-b from-[#E8F4F2] to-white flex flex-col w-full">
 
      <div
        class="fixed z-50"
        :style="{ top: '0.5rem', right: '1rem' }"
      >
        <UnifiedVideo 
          position="top-right" 
          :enable-rotation="true"
          instance-id="info-details-top-right"
          page-type="infoDetails"
        />
      </div>
      <!-- Основной контент -->
      <main class="flex-1 flex flex-col bg-white px-2 sm:px-4 py-4 sm:py-6 overflow-y-auto min-h-0">
        <!-- Иконка помощи -->
        <div class="flex justify-center my-6 sm:my-8 lg:my-10 mt-18">
         <img src="../assets/clinic.svg" alt="info-service" class="mt-18 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 4k:w-40 4k:h-40 4k-plus:w-48 4k-plus:h-48"></img>
        </div>
  
        <!-- Заголовок -->
        <p class="text-[#11AE78] font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl 4k:text-4xl 4k-plus:text-5xl text-center mb-6 sm:mb-8 lg:mb-10 px-2">
          {{ $t('general_services') }}
        </p>
        <div v-if="loading" class="flex justify-center items-center py-8">
          <a-spin size="large" />
        </div>
        <div v-else-if="selectedFaq" class="mx-2 sm:mx-4 lg:mx-6">
          <div class="bg-white rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 shadow-lg">
            <!-- Question -->
            <h2 class="text-[#11AE78] font-bold text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 break-words question-text">
              {{ selectedFaq.question }}
            </h2>
            <!-- Answer -->
            <div class="text-gray-700 text-base sm:text-lg whitespace-pre-line break-words answer-text">
              {{ selectedFaq.answer }}
            </div>
          </div>
        </div>
        <div v-else class="flex justify-center items-center py-8">
          <p class="text-gray-500">{{ $t('faq_not_found') || 'FAQ not found' }}</p>
        </div>

       </main>
  
  
  
        <FooterNav :showHomeButton="true" :showLanguageButton="true" />
 
    </div>
  </template>
  
<script setup lang="ts">
import { useRoute } from "vue-router";
import FooterNav from "../components/FooterNav.vue";
import UnifiedVideo from "../components/UnifiedVideo.vue";
import { useI18n } from "vue-i18n";
import { ref, onMounted, watch, computed } from "vue";
import { getFaqByLanguage, type FAQItem } from "../api/faq";

const route = useRoute();
const { t: $t, locale } = useI18n();

const faqList = ref<FAQItem[]>([]);
const loading = ref(false);

// Get selected FAQ by ID from route
const selectedFaq = computed(() => {
  const faqId = route.params.id as string;
  if (!faqId) return null;
  return faqList.value.find(faq => faq.id === faqId) || null;
});

// Fetch FAQ data based on current language
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

// Watch for language changes and refetch
watch(() => locale.value, () => {
  fetchFaq();
}, { immediate: false });

// Watch for route changes (when FAQ ID changes)
watch(() => route.params.id, () => {
  // FAQ list is already loaded, just need to update computed
}, { immediate: false });

// Fetch FAQ on mount
onMounted(() => {
  fetchFaq();
});
</script>
  
  <style scoped>
  .question-text,
  .answer-text {
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
    max-width: 100%;
  }
  
  .custom-collapse :deep(.ant-collapse-item) {
    border: none !important; /* убираем границы */
  }
  
  .custom-collapse :deep(.ant-collapse-header) {
    padding-left: 0.75rem !important; /* текст ближе к левому краю */
    font-weight: 600;
    font-size: 16px;
    color: black;
    text-align: left;
  }
  
  /* Стили для 4K экранов */
  @media (min-width: 2560px), (min-height: 1440px) {
    .custom-collapse :deep(.ant-collapse-header) {
      font-size: 20px !important;
      padding: 16px 12px !important;
    }
    
    .custom-collapse :deep(.ant-collapse-content-box) {
      font-size: 18px !important;
      padding: 16px 20px !important;
    }
    
    .custom-collapse :deep(.ant-collapse-content-box ul) {
      font-size: 18px !important;
    }
    
    .custom-collapse :deep(.ant-collapse-content-box li) {
      font-size: 18px !important;
      margin-bottom: 8px !important;
    }
  }
  
  @media (min-width: 3840px), (min-height: 2160px) {
    .custom-collapse :deep(.ant-collapse-header) {
      font-size: 24px !important;
      padding: 20px 16px !important;
    }
    
    .custom-collapse :deep(.ant-collapse-content-box) {
      font-size: 22px !important;
      padding: 20px 24px !important;
    }
    
    .custom-collapse :deep(.ant-collapse-content-box ul) {
      font-size: 22px !important;
    }
    
    .custom-collapse :deep(.ant-collapse-content-box li) {
      font-size: 22px !important;
      margin-bottom: 10px !important;
    }
  }
  
  .custom-collapse :deep(.ant-collapse-content-box) {
    padding-left: 1rem; /* чтобы списки были чуть смещены */
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  /* Адаптивные стили для мобильных устройств */
  @media (min-width: 640px) {
    .custom-collapse :deep(.ant-collapse-header) {
      padding-left: 1rem !important;
      font-size: 15px;
    }
    
    .custom-collapse :deep(.ant-collapse-content-box) {
      padding-left: 1.5rem;
    }
  }

  @media (min-width: 1024px) {
    .custom-collapse :deep(.ant-collapse-header) {
      font-size: 16px;
    }
  }
  </style>
  