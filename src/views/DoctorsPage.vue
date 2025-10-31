<template>
  <div
    class="h-screen bg-gradient-to-b from-[#E8F4F2] to-white flex flex-col w-full   pt-14"
  >
    <main class="flex-1 flex flex-col bg-white pb-24 ">
      <CheckIin />
      <div class="flex-1 bg-[#E8F4F2] flex flex-col mt-2 rounded-t-xl">
        <div class="text-black font-bold text-xl 4k:text-2xl 4k-plus:text-3xl my-4">
          {{ isSearchMode ? `${$t('search')} ${$t('results')}: "${searchQuery}"` : (doctors[0]?.specialty || $t('doctors')) }}
        </div>
       

        <!-- Таблица врачей -->
        <div class="bg-white rounded shadow mt-4 flex-1 flex flex-col min-h-96">
          <div class="bg-[#f9f9f9] rounded-lg overflow-hidden flex-1 flex flex-col min-h-0 doctors-table">
            <!-- Заголовки таблицы -->
            <div class="bg-[#E8F4F2] names px-4 py-3 grid grid-cols-4 gap-4 text-sm 4k:text-base 4k-plus:text-lg font-bold text-[#11AE78] text-left">
              <div class="text-left">{{ $t('doctors_table_headers.full_name') }}</div>
              <div class="text-left">{{ $t('doctors_table_headers.specialty') }}</div>
              <div class="text-left">{{ $t('doctors_table_headers.cabinet') }}</div>
              <div class="text-left">{{ $t('doctors_table_headers.working_hours') }}</div>
            </div>
            
            <!-- Данные таблицы -->
            <div class="table-scroll">
              <div 
                v-for="(doctor, index) in (isSearchMode ? searchResults : doctors)" 
                :key="isSearchMode ? doctor.doctor_id : (doctor as any).id"
                :class="[
                  'px-4 py-4 grid grid-cols-4 gap-4 text-sm border-b border-[#e0e0e0] hover:bg-[#f0f0f0] text-left',
                  index % 2 === 0 ? 'bg-white' : 'bg-[#E8F4F2]'
                ]"
              >
                <div class="font-medium text-[#333333] name text-left">{{ doctor.full_name }}</div>
                <div class="text-[#666666] font-bold name font-medium text-left">{{ doctor.specialty }}</div>
                <div class="text-[#666666] font-bold name font-medium text-left">{{ doctor.cabinet }}</div>
                <div class="flex flex-col text-left">
                  <div class="text-[#666666]">
                    <!-- <div v-if="doctor.schedule_string" class="space-y-1">
                      <div v-for="(schedule, idx) in doctor.schedule_string.split(';')" :key="idx" class="text-xs">
                        {{ schedule.trim() }}
                      </div>
                    </div> -->
                    <span class="font-bold"> пн. ср, пт<br/> 14:00-20:00<br/> вт, чт 8:00-14:00</span>
                  </div>
                  <div class="mt-2">
                    <div 
                      @click="openScheduleModal(doctor)"
                      class="book-appointment-btn border-2 border-[#11AE78] rounded-[20px] px-4 py-2 4k:px-6 4k:py-3 4k-plus:px-8 4k-plus:py-4 text-[#11AE78] font-bold text-sm 4k:text-base 4k-plus:text-lg hover:bg-[#11AE78] hover:text-white transition-colors"
                      style="border: 2px solid #11AE78 !important; color: #11AE78 !important; background-color: transparent !important;"
                    >
                      {{ $t('book_appointment') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Фиксированный футер -->
    <div class="fixed bottom-0 left-0 right-0 z-40">
      <FooterNav :showHomeButton="true" :showLanguageButton="true" />
    </div>
    
    <SchedulePage 
      v-model:visible="visible" 
      :doctor="doctor" 
      @booked="handleAppointmentBooked" 
    />
    
    <!-- Модалка подтверждения записи -->
    <a-modal
      v-model:open="showApprovePage"
      width="800px"
      rounded-lg
      centered
      :footer="null"
      :body-style="{ padding: '0px' }"
      :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }"
      class="approve-modal"
      :closable="false"
      :mask-closable="false"
    >
      <ApprovePage 
        v-if="appointmentResult"
        :appointment-result="appointmentResult"
        @close="closeApprovePage"
      />
    </a-modal>

  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { DoctorsApi, type Doctor } from "../api/doctors";
import { type SearchDoctor } from "../api/search";
import FooterNav from "../components/FooterNav.vue";
import CheckIin from "./CheckIin.vue";
import SchedulePage from "../components/SchedulePage.vue";
import ApprovePage from "../components/ApprovePage.vue";
import { useUserStore } from "../store/index";
import { useI18n } from "vue-i18n";
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();
// const isLoading = ref(false); // Удалено - больше не используется
const error = ref<string | null>(null);
const doctors = ref<Doctor[]>([]);
const clinicSpecialtyId = ref<string | null>(
  (route.query.clinic_specialty_id as string) || null
);
const clinicId = ref<string | null>(
  (route.query.clinic_id as string) || null
);

// Search results handling
const searchQuery = ref<string | null>(
  (route.query.search as string) || null
);
const searchResults = ref<SearchDoctor[]>([]);
const isSearchMode = ref(false);

const visible = ref(false);
const doctor = ref<Doctor | null>(null);
const showApprovePage = ref(false);
const appointmentResult = ref<any>(null);
// Удалены колонки Ant Design - теперь используем кастомные таблицы


// Удалена функция rowClassName - теперь используем CSS классы напрямую

// Загрузка данных ОСМС
onMounted(async () => {
  // Проверяем, есть ли результаты поиска
  if (route.query.results) {
    try {
      searchResults.value = JSON.parse(route.query.results as string);
      isSearchMode.value = true;
    } catch (error) {
      // Если не удалось распарсить результаты, загружаем обычных врачей
      fetchDoctors();
    }
  } else {
    fetchDoctors();
  }
});
async function fetchDoctors() {
  if (!clinicSpecialtyId.value || !clinicId.value) {
    console.log('Missing parameters:', { clinicSpecialtyId: clinicSpecialtyId.value, clinicId: clinicId.value });
    return;
  }
  
  console.log('Fetching doctors with params:', { 
    clinic_id: clinicId.value, 
    clinic_specialty_id: clinicSpecialtyId.value 
  });
  
  error.value = null;

  try {
    const params = { 
      clinic_id: clinicId.value, 
      clinic_specialty_id: clinicSpecialtyId.value 
    };
    const res = await DoctorsApi("", params, "GET");
    console.log('API Response:', res);
    
    const payload = res?.data ?? res;
    console.log('Payload:', payload);

    // Обрабатываем новую структуру данных
    if (payload && payload.data && payload.data.doctors && Array.isArray(payload.data.doctors)) {
      console.log('Processing doctors:', payload.data.doctors);
      
      doctors.value = payload.data.doctors.map((doctor: any) => {
        const processedDoctor = {
          ...doctor,
          // Добавляем поля для совместимости с существующим кодом
          doctor_id: doctor.id,
          specialty: doctor.specialties && doctor.specialties.length > 0 
            ? doctor.specialties[0].specialty.name 
            : 'Специальность не указана',
          cabinet: doctor.cabinet || 'Не указан',
          schedule_string: doctor.schedules && doctor.schedules.length > 0 
            ? doctor.schedules.map((s: any) => s.schedule_string).join('; ')
            : 'По записи',
          type: 'oms' as const
        };
        console.log('Processed doctor:', processedDoctor);
        return processedDoctor;
      });
      
      console.log('Final doctors array:', doctors.value);
    } else {
      console.log('No doctors found in payload. Payload structure:', payload);
      console.log('Available keys in payload:', payload ? Object.keys(payload) : 'payload is null/undefined');
      doctors.value = [];
    }
  } catch (err: any) {
    console.error('Error fetching doctors:', err);
    error.value = err?.response?.data?.message ?? err.message ?? String(err);
  }
}
function openScheduleModal(selectedDoctor: Doctor | SearchDoctor) {
  // Проверяем наличие ИИН
  if (!userStore.iin || userStore.iin.length !== 12) {
    router.push("/auth-page");
    return;
  }
  
  // Если это результат поиска, преобразуем его в формат Doctor
  if (isSearchMode.value && 'clinic_name' in selectedDoctor) {
    const searchDoctor = selectedDoctor as SearchDoctor;
    doctor.value = {
      id: searchDoctor.doctor_id.toString(),
      clinic_id: '',
      full_name: searchDoctor.full_name,
      is_active: true,
      created_date: '',
      updated_date: '',
      doctor_id: searchDoctor.doctor_id.toString(),
      specialty: searchDoctor.specialty,
      cabinet: searchDoctor.cabinet,
      schedule_string: searchDoctor.schedule_string || t('by_appointment'),
      type: 'oms' as const
    };
  } else {
    const doctorData = selectedDoctor as Doctor;
    doctor.value = {
      ...doctorData,
      doctor_id: doctorData.doctor_id || doctorData.id,
      specialty: doctorData.specialty || (doctorData.specialties && doctorData.specialties.length > 0 
        ? doctorData.specialties[0]?.specialty?.name || 'Специальность не указана'
        : 'Специальность не указана'),
      cabinet: doctorData.cabinet || 'Не указан',
      schedule_string: doctorData.schedule_string || 'По записи',
      type: doctorData.type || 'oms'
    };
  }
  
  visible.value = true;
}


function handleAppointmentBooked(appointmentInfo: any) {
  appointmentResult.value = appointmentInfo.appointmentResult;
  showApprovePage.value = true;
}

function closeApprovePage() {
  showApprovePage.value = false;
  appointmentResult.value = null;
  // Сбрасываем ИИН при закрытии ApprovePage
  userStore.clearIin();
  // Закрываем модалку расписания и очищаем состояние
  visible.value = false;
  doctor.value = null;
}


</script>

<style>
/* Адаптивные стили для терминала 1440x2560 */
@media (min-width: 1440px) and (min-height: 2560px) {
  .bg-white {
    font-size: 18px;
  }
  
  .grid {
    gap: 1.5rem;
  }
  
  .px-4 {
    padding-left: 2rem;
    padding-right: 2rem;
  }
  
  .py-4 {
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }
  
  .text-sm {
    font-size: 16px;
  }
  
  .text-xs {
    font-size: 14px;
  }
  
  
  /* Улучшенная прокрутка */
  .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: #11AE78 #f0f0f0;
  }
  
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 4px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #11AE78;
    border-radius: 4px;
  }
  
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #0E9A6A;
  }
  
  
  .py-3 {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  
  .px-6 {
    padding-left: 2rem;
    padding-right: 2rem;
  }
  
  .py-4 {
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }
}

/* Стили для кастомных таблиц - используем более специфичные селекторы */
.doctors-table .grid {
  display: grid;
}

.doctors-table .grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.doctors-table .grid-cols-5 {
  grid-template-columns: repeat(5, 1fr);
}

/* Принудительное выравнивание по левому краю для всех ячеек таблиц */
.doctors-table .grid > div {
  text-align: left !important;
  justify-content: flex-start !important;
  align-items: flex-start !important;
}

/* Специально для заголовков таблиц */
.names > div {
  text-align: left !important;
}

/* Специально для данных таблиц */
.table-scroll > div > div {
  text-align: left !important;
}

/* Явные цвета для предотвращения черных цветов */
.bg-\[#f5f5f5\] {
  background-color: #f5f5f5 !important;
}

.text-\[#666666\] {
  color: #666666 !important;
}

.bg-\[#e5e5e5\] {
  background-color: #e5e5e5 !important;
}

.text-\[#333333\] {
  color: #333333 !important;
}

.bg-\[#f9f9f9\] {
  background-color: #f9f9f9 !important;
}

.border-\[#e0e0e0\] {
  border-color: #e0e0e0 !important;
}

.hover\:bg-\[#f0f0f0\]:hover {
  background-color: #f0f0f0 !important;
}

.hover\:bg-\[#e5e5e5\]:hover {
  background-color: #e5e5e5 !important;
}

/* Зеленые цвета для активных элементов */
.bg-\[#11AE78\] {
  background-color: #11AE78 !important;
}

.text-\[#11AE78\] {
  color: #11AE78 !important;
}

.border-\[#11AE78\] {
  border-color: #11AE78 !important;
}

.hover\:bg-\[#11AE78\]:hover {
  background-color: #11AE78 !important;
}

.hover\:text-white:hover {
  color: white !important;
}

.bg-\[#0E9A6A\] {
  background-color: #0E9A6A !important;
}

.hover\:bg-\[#0E9A6A\]:hover {
  background-color: #0E9A6A !important;
}

/* Принудительные стили для кнопок "Записаться" */
button[class*="border-2"][class*="border-[#11AE78]"] {
  border: 2px solid #11AE78 !important;
  color: #11AE78 !important;
  background-color: transparent !important;
}

button[class*="border-2"][class*="border-[#11AE78]"]:hover {
  background-color: #11AE78 !important;
  color: white !important;
}

/* Универсальные стили для всех кнопок "Записаться" */
button:has-text("Записаться"),
button[class*="book_appointment"],
button[class*="ml-2"][class*="border-2"] {
  border: 2px solid #11AE78 !important;
  color: #11AE78 !important;
  background-color: transparent !important;
}

button:has-text("Записаться"):hover,
button[class*="book_appointment"]:hover,
button[class*="ml-2"][class*="border-2"]:hover {
  background-color: #11AE78 !important;
  color: white !important;
}

/* Стили для кнопок "?" */
button[class*="bg-[#11AE78]"] {
  background-color: #11AE78 !important;
  color: white !important;
}

button[class*="bg-[#11AE78]"]:hover {
  background-color: #0E9A6A !important;
}

/* Hover эффекты для кнопок */
button[class*="border-2"][class*="border-[#11AE78]"]:hover {
  background-color: #11AE78 !important;
  color: white !important;
}

/* Принудительные стили для всех кнопок с зеленой рамкой */
button[style*="border: 2px solid #11AE78"]:hover {
  background-color: #11AE78 !important;
  color: white !important;
}

button[style*="background-color: #11AE78"]:hover {
  background-color: #0E9A6A !important;
}

/* Стили для кнопок */
button {
  transition: all 0.3s ease;
}

/* Максимально специфичные стили для кнопок "Записаться" */
div[class*="flex items-center justify-between"] button,
div[class*="flex items-center justify-end"] button[class*="border-2"] {
  border: 2px solid #11AE78 !important;
  color: #11AE78 !important;
  background-color: transparent !important;
}

div[class*="flex items-center justify-between"] button:hover,
div[class*="flex items-center justify-end"] button[class*="border-2"]:hover {
  background-color: #11AE78 !important;
  color: white !important;
}

/* Принудительные стили для всех кнопок с текстом "Записаться" */
button:contains("Записаться") {
  border: 2px solid #11AE78 !important;
  color: #11AE78 !important;
  background-color: transparent !important;
}

button:contains("Записаться"):hover {
  background-color: #11AE78 !important;
  color: white !important;
}


button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Стили для скролла */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #11AE78 #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #11AE78;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #0E9A6A;
}

/* Адаптивная высота для прокрутки */
.table-scroll {
  max-height: 50vh !important;
  min-height: 200px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  scrollbar-gutter: stable;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Обеспечиваем правильную работу flex-контейнеров */
.bg-\[#f9f9f9\] {
  min-height: 0 !important;
}

/* Специальные стили для 4K экранов */
@media (min-width: 2560px), (min-height: 1440px) {
  .table-scroll {
    max-height: 60vh !important;
    min-height: 300px !important;
  }
}

@media (min-width: 3840px), (min-height: 2160px) {
  .table-scroll {
    max-height: 65vh !important;
    min-height: 400px !important;
  }
}

/* Принудительная прокрутка - одинаковый размер для всех скроллбаров */
.table-scroll::-webkit-scrollbar {
  width: 8px !important;
  height: 8px !important;
  display: block !important;
  -webkit-appearance: none;
}

.table-scroll::-webkit-scrollbar-track {
  background: #f0f0f0 !important;
  border-radius: 4px !important;
}

.table-scroll::-webkit-scrollbar-thumb {
  background: #11AE78 !important;
  border-radius: 4px !important;
}

.table-scroll::-webkit-scrollbar-thumb:hover {
  background: #0E9A6A !important;
}

/* Вертикальный скроллбар */
.table-scroll::-webkit-scrollbar:vertical {
  width: 8px !important;
}

/* Горизонтальный скроллбар */
.table-scroll::-webkit-scrollbar:horizontal {
  height: 8px !important;
}

/* Стили для модального окна подтверждения */
.approve-modal .ant-modal {
  max-width: 500px !important;
  margin: 0 auto !important;
}

.approve-modal .ant-modal-content {
  border-radius: 12px !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
  overflow: hidden !important;
}

.approve-modal .ant-modal-body {
  padding: 0 !important;
  height: auto !important;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 640px) {
  .approve-modal .ant-modal {
    max-width: 100vw !important;
    margin: 0 !important;
  }
  
  .approve-modal .ant-modal-content {
    border-radius: 0 !important;
    box-shadow: none !important;
  }
}


/* Заголовки таблицы */
.ant-table-thead > tr > th {
  
  color: #11ae78  !important;
  font-weight: bold;
}

/* Зебра-строки */
.row-light {
  background-color: #f2fdf9 !important;
}
.row-white {
  background-color: #ffffff !important;
}

/* Кнопки */
.custom-green-btn {
  background-color: #11ae78 !important;
  border-color: #11ae78 !important;
  color: #fff !important;
}

/* Стили для расписания */
.schedule-text {
  margin-bottom: 8px;
  max-width: 200px;
}

.schedule-item {
  font-size: 13px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.schedule-item:last-child {
  margin-bottom: 0;
}
.question-btn {
  border: 1px solid #11ae78 !important;
  color: #11ae78 !important;
  font-weight: bold;
}

/* Анимация свечения видео */
.video-glow {
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(197, 230, 220, 0.6), 0 2px 8px rgba(17, 174, 120, 0.1);
  }
  50% {
    box-shadow: 0 4px 25px rgba(197, 230, 220, 0.8), 0 2px 12px rgba(17, 174, 120, 0.2);
  }
}


</style>

