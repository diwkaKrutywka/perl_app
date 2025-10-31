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
      <div class="flex justify-center my-6 sm:my-8 lg:my-10">
       <img src="../assets/ask.svg" alt="info-service" class="w-25 h-25 sm:w-28 sm:h-28 lg:w-28 lg:h-28 xl:w-32 xl:h-32"></img>
      </div>

      <!-- Заголовок -->
      <p class="text-[#11AE78] font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-center mb-6 sm:mb-8 px-2">
        {{ $t('service_info') }}
      </p>

      <!-- Список услуг -->
      <div class="space-y-2 sm:space-y-3 mb-6 sm:mb-8 mx-2 sm:mx-4 lg:mx-6">
        <div 
          v-for="service in services" 
          :key="service.id"
          @click="selectService('info-details')"
          class="bg-gradient-to-r from-[#11AE78] to-[#14865E] hover:from-[#0E9A6A] hover:to-[#0C593E] text-white font-bold py-3 sm:py-4 details px-4 sm:px-6 rounded-[16px] sm:rounded-[20px] cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-between"
        >
          <span class="text-xs sm:text-xs md:text-sm lg:text-md">{{ service.name }}</span>
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
const router = useRouter();
const { t: $t } = useI18n();

// Состояние глобальной анимации
const isGlobalAnimating = ref(true); // Начинаем со скрытого состояния

// Данные услуг - делаем реактивными
const services = ref([
  { id: 'general', name: $t('services_list.general') },
  { id: 'appointment', name: $t('services_list.appointment') },
  { id: 'documents', name: $t('services_list.documents') },
  { id: 'payment', name: $t('services_list.payment') },
  { id: 'results', name: $t('services_list.results') }
]);

// Функция для обновления переводов
const updateServices = () => {
  services.value = [
    { id: 'general', name: $t('services_list.general') },
    { id: 'appointment', name: $t('services_list.appointment') },
    { id: 'documents', name: $t('services_list.documents') },
    { id: 'payment', name: $t('services_list.payment') },
    { id: 'results', name: $t('services_list.results') }
  ];
};

// Функции навигации
const selectService = (serviceId: string) => {
  // Здесь можно добавить логику для каждой услуги
  // Например, переход на соответствующие страницы
  switch(serviceId) {
    case 'info-details':
      router.push('/info-details');
      break;
    case 'aigerim':
      router.push('/chat');
      break;
    case 'general':
    case 'documents':
    case 'payment':
    case 'results':
      // Показываем демо-сообщение
      const service = services.value.filter((s: any) => s.id === serviceId)[0];
      alert($t('service_info_alert', { serviceName: service?.name }));
      break;
  }
};

// Отслеживаем изменения языка и обновляем переводы
watch(() => $t('services_list.general'), () => {
  updateServices();
}, { immediate: false });

// Показываем локальное видео после исчезновения глобального
onMounted(() => {
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