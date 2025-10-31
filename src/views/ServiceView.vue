<template>
    <div class="h-screen flex flex-col overflow-hidden min-h-screen w-full ">
     
    <!-- Видео в правом верху (скрыто во время глобальной анимации) -->
    <div
      class="service-video-container fixed z-50"
      :class="{ 'hidden-during-animation': isGlobalAnimating }"
      :style="{ top: '0.5rem', right: '1rem' }"
    >
      <UnifiedVideo 
        position="top-right" 
        :enable-rotation="true"
        instance-id="service-top-right"
        page-type="services"
      />
    </div>
    <main class="flex-1 flex flex-col items-center justify-center px-4 py-2 sm:py-4 bg-white min-w-[100%]" >

      <CheckIin />
     
      <div
        class="flex-1 bg-[#E8F4F2] flex flex-col overflow-y-auto mt-2 rounded-t-xl min-w-[100%] "
      >
        <!-- Заголовок отделений - фиксированный -->
        <div class="p-4 flex-shrink-0">
          <p class="text-black font-bold text-xl mb-4">{{ $t('departments') }}</p>
        </div>

        <!-- Контент с прокруткой -->
        <div class="flex-1 px-4 pb-24 sm:pb-28 lg:pb-32 4k:pb-36 4k-plus:pb-40 overflow-y-auto">
          <!-- Лоадер -->
          <div v-if="isLoading" class="flex justify-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#11AE78]"
            ></div>
          </div>

          <!-- Ошибка загрузки -->
          <div v-else-if="error" class="text-red-500 text-center py-4">
            <p>{{ error }}</p>
            <button
              @click="loadSpecialties"
              class="mt-2 px-4 py-2 bg-[#11AE78] text-white rounded-lg hover:bg-[#0E9A6A] transition-colors"
            >
              {{ $t('try_again') }}
            </button>
          </div>

          <!-- Список специальностей -->
          <div v-else class="grid gap-3 pb-4">
            <div
              v-for="(specialty, index) in specialties"
              :key="specialty.id"
              @click="selectSpecialty(specialty.id)"
              class="specialty-button w-full flex justify-between items-center bg-gradient-to-r from-[#14865E] to-[#11AE78] hover:from-[#117A52] hover:to-[#0E9A6A] text-white font-medium py-4 px-6 rounded-2xl text-base sm:text-lg lg:text-xl 4k:text-xl 4k-plus:text-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
              :class="{ 'animate-specialty': showSpecialties }"
              :style="{
                animationDelay: showSpecialties ? `${index * 150}ms` : '0ms',
              }"
            >
              <span class="text-white font-medium text-md sm:text-md lg:text-lg 4k:text-xl 4k-plus:text-2xl">{{ specialty.name }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="white"
                class="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex-shrink-0"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </main>
    <FooterNav :showLanguageButton="true" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { SpecialtiesApi } from "../api/specialties";
import FooterNav from "../components/FooterNav.vue";
import UnifiedVideo from "../components/UnifiedVideo.vue";
import { useRouter } from "vue-router";
import CheckIin from "./CheckIin.vue";
import { useI18n } from "vue-i18n";
const router = useRouter();
const { t } = useI18n();

// Интерфейс для специальности
interface Specialty {
  id: string;
  name: string;
  description?: string;
}

// Интерфейс для элемента clinic_specialties
interface ClinicSpecialty {
  id: string;
  clinic_id: string;
  description: string;
  description_kz: string;
  is_active: boolean;
  shared_specialty: {
    id: string;
    name: string;
    name_kz: string;
    description: string;
    description_kz: string;
    is_active: boolean;
    created_date: string;
    updated_date: string;
  };
  created_date: string;
  updated_date: string;
}


// Состояние для специальностей
const specialties = ref<Specialty[]>([]);
const clinicSpecialties = ref<ClinicSpecialty[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Состояние глобальной анимации
const isGlobalAnimating = ref(true); // Начинаем со скрытого состояния

// Состояние анимации специальностей
const showSpecialties = ref(false);

onMounted(() => {
  loadSpecialties(); // Загружаем специальности при монтировании

  // Показываем локальное видео сразу после исчезновения глобального
  setTimeout(() => {
    isGlobalAnimating.value = false;
  }, 1200); // Появляется почти одновременно с исчезновением глобального

  // Дополнительная гарантия скрытия глобального видео
  setTimeout(() => {
    (window as any).forceHideGlobalVideo?.();
  }, 1400); // Двойная гарантия
});

onUnmounted(() => {
  // Очистка интервала времени теперь происходит в useDateTime composable
});

// Загрузка специальностей
const loadSpecialties = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await SpecialtiesApi("578b99c8-1234-4537-af69-640f8edf77cd/", {}, "GET");
    
    console.log('API Response data:', response.data);

    if (response.data && response.data.data && response.data.data.clinic_specialties && Array.isArray(response.data.data.clinic_specialties)) {
      // Сохраняем полные данные о специальностях клиники
      clinicSpecialties.value = response.data.data.clinic_specialties;
      
      // Извлекаем специальности из вложенной структуры
      specialties.value = response.data.data.clinic_specialties
        .filter((item: ClinicSpecialty) => item.is_active && item.shared_specialty.is_active) // Фильтруем только активные
        .map((item: ClinicSpecialty) => ({
          id: item.shared_specialty.id,
          name: item.shared_specialty.name,
          description: item.shared_specialty.description
        }));

      console.log('Processed specialties:', specialties.value); // Для отладки

      // Запускаем анимацию появления кнопок с небольшой задержкой
      setTimeout(() => {
        showSpecialties.value = true;
      }, 300);
    } else {
      // Проверяем альтернативные структуры данных
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('Data found in response.data.data:', response.data.data);
        // Если данные приходят в response.data.data
        specialties.value = response.data.data
          .filter((item: any) => item.is_active && item.shared_specialty?.is_active)
          .map((item: any) => ({
            id: item.shared_specialty?.id || item.id,
            name: item.shared_specialty?.name || item.name,
            description: item.shared_specialty?.description || item.description
          }));
        
        console.log('Processed specialties (data.data):', specialties.value);
        
        setTimeout(() => {
          showSpecialties.value = true;
        }, 300);
      } else if (response.data && Array.isArray(response.data)) {
        console.log('Data is direct array:', response.data);
        // Если данные приходят как массив напрямую
        specialties.value = response.data
          .filter((item: any) => item.is_active && item.shared_specialty?.is_active)
          .map((item: any) => ({
            id: item.shared_specialty?.id || item.id,
            name: item.shared_specialty?.name || item.name,
            description: item.shared_specialty?.description || item.description
          }));
        
        console.log('Processed specialties (direct array):', specialties.value);
        
        setTimeout(() => {
          showSpecialties.value = true;
        }, 300);
      } else {
        console.error('Unexpected data structure:', response.data);
        throw new Error("Неверный формат данных");
      }
    }
  } catch (err: any) {
    console.error('Ошибка загрузки специальностей:', err);
    error.value = err.message || 'Ошибка загрузки данных';
  } finally {
    isLoading.value = false;
  }
};

// Выбор специальности
const selectSpecialty = (specialtyId: string) => {
  console.log('Selecting specialty:', specialtyId);
  console.log('Available clinic specialties:', clinicSpecialties.value);
  
  // Находим clinic_specialty_id для выбранной специальности
  const clinicSpecialty = clinicSpecialties.value.find(
    (item: ClinicSpecialty) => item.shared_specialty.id === specialtyId
  );
  
  console.log('Found clinic specialty:', clinicSpecialty);
  
  if (clinicSpecialty) {
    const queryParams = {
      clinic_specialty_id: clinicSpecialty.id,
      clinic_id: "578b99c8-1234-4537-af69-640f8edf77cd"
    };
    console.log('Navigating to doctors with params:', queryParams);
    
    router.push({
      path: "/doctors",
      query: queryParams
    });
  } else {
    console.error('Clinic specialty not found for specialtyId:', specialtyId);
  }
};

// const startService = () => {
//   router.push("/language-selection");
// };
</script>

<style scoped>
.hidden-during-animation {
  opacity: 0;
  visibility: hidden;
}

.service-video-container {
  transition: opacity 0.1s ease-in-out, visibility 0.1s ease-in-out;
}

.service-video-container:not(.hidden-during-animation) {
  opacity: 1;
  visibility: visible;
}

/* Анимация появления кнопок специальностей */
.specialty-button {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;

}

.specialty-button.animate-specialty {
  animation: slideInUp 0.6s ease-out forwards;
}

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
