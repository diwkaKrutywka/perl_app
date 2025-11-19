<template>
  <a-modal
    :open="visible"
    width="800px"
    centered
    :footer="null"
    :wrap-class-name="'no-padding-modal'"
    class="schedule-modal"
    :styles="{ body: { padding: 0, maxHeight: '80vh', overflowY: 'auto' } }"
    @cancel="handleClose"
    @update:open="(val: boolean) => emit('update:visible', val)"
  >
    <div class="modal-inner" >
      <!-- Инфо о докторе -->
      <div v-if="doctor" class="text-center mb-4 p-8">
        <div class="font-bold text-lg">{{ doctor.full_name || currentSchedule?.specialist_name }}</div>
        <div class="text-green-600">
          {{ doctor.specialty }} / {{ currentSchedule?.cabinet || `Каб. №${doctor.cabinet}` }}
        </div>
        <div v-if="currentSchedule?.address_name" class="text-gray-500 text-sm text-center mt-2">
          {{ currentSchedule.address_name }}
        </div>
        <div class="text-gray-500 text-sm text-center">
          {{ $t('working_hours_monday') }}<br/>
          {{ $t('working_hours_tuesday') }}
        </div>
      </div>

      <!-- Календарь -->
      <div class="mb-4">
        <div class="font-semibold mb-2 text-center">{{ $t('select_appointment_date') }}</div>
        <div class="calendar-wrapper">
          <!-- Левая стрелка -->
          <button 
            class="calendar-nav-arrow left-arrow"
            @click="handleMonthChange(-1)"
          >
            ←
          </button>
          
          <!-- Календарь -->
          <a-calendar
            v-model:value="selectedDate"
            :disabled-date="disabledDate"
            :fullscreen="false"
            class="mini-calendar rounded-md"
          >
            <template #headerRender="{ value }">
              <div class="calendar-header">
                <div class="calendar-title">{{ getMonthYearTitle(value) }}</div>
              </div>
            </template>
            <template #dateFullCellRender="{ current }">
              <div
                :class="[
                  'w-8 h-8 flex items-center justify-center rounded-full relative',
                  selectedDate && current.isSame(selectedDate, 'day')
                    ? 'bg-[#11AE78] text-white font-bold cursor-pointer'
                    : hasAvailableSlots(current)
                    ? 'hover:bg-gray-100 date-with-slots cursor-pointer'
                    : disabledDate(current)
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-gray-100 opacity-50 cursor-pointer',
                ]"
                @click="() => !disabledDate(current) && selectDate(current)"
              >
                {{ current.date() }}
                <!-- Индикатор наличия слотов -->
                <span
                  v-if="hasAvailableSlots(current) && (!selectedDate || !current.isSame(selectedDate, 'day'))"
                  class="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#11AE78] rounded-full"
                  style="box-shadow: 0 0 2px rgba(17, 174, 120, 0.5);"
                ></span>
              </div>
            </template>
          </a-calendar>
          
          <!-- Правая стрелка -->
          <button 
            class="calendar-nav-arrow right-arrow"
            @click="handleMonthChange(1)"
          >
            →
          </button>
        </div>
      </div>

      <!-- Время приёма -->
      <div v-if="isLoadingSlots" class="mb-4 max-w-md mx-auto">
        <div class="font-semibold mb-2 text-center">{{ $t('select_appointment_time') }}</div>
        <div class="flex justify-center items-center px-[20px] py-[20px]">
          <a-spin size="large" />
        </div>
      </div>
      <div v-else-if="timeSlots.length" class="mb-4 max-w-md mx-auto">
        <div class="font-semibold mb-2 text-center">{{ $t('select_appointment_time') }}</div>
        <div class="flex flex-wrap gap-1 px-[20px] py-[20px]">
          <a-button
            v-for="slot in timeSlots"
            :key="slot.time"
            :type="selectedTime === slot.time ? 'primary' : 'default'"
            :class="[
              'time-slot',
              selectedTime === slot.time ? 'selected-slot' : '',
              slot.is_available ? 'available-slot' : 'unavailable-slot',
            ]"
            :disabled="!slot.is_available"
            @click="slot.is_available && (selectedTime = slot.time)"
          >
            {{ slot.time }}
          </a-button>
        </div>
      </div>
      <div v-else-if="selectedDate && !isLoadingSlots" class="mb-4 max-w-md mx-auto">
        <div class="font-semibold mb-2 text-center">{{ $t('select_appointment_time') }}</div>
        <div class="text-center text-gray-500 px-[20px] py-[20px]">
          {{ $t('no_available_slots') }}
        </div>
      </div>

      <!-- Записаться -->
      <div class="text-center flex items-center justify-center ">
        <a-button
          type="primary"
          class="custom-green-btn px-8 py-6"
          :disabled="!selectedDate || !selectedTime"
          @click="bookAppointment"
        >
          <span class="text-white px-6"> {{ $t('book_appointment_button') }} </span>
        </a-button>
      </div>

      <!-- Кнопка закрыть -->
      <div class="mt-4 bg-[#E8F4F2] flex justify-center">
        <div
          class="text-center my-4 bg-white border-2 border-[#11AE78] rounded-full px-4 py-2 text-[#11AE78] font-bold w-fit cursor-pointer"
          @click="handleClose"
        >
          {{ $t('close_button_text') }}
        </div>
      </div>
    </div>
  </a-modal>

  <!-- Модалка подтверждения -->
  <a-modal
    :open="showConfirmation"
    width="500px"
    centered
    :footer="null"
    :body-style="{ padding: '0px' }"
    class="confirmation-modal"
    @cancel="cancelConfirmation"
    @update:open="(val: boolean) => showConfirmation = val"
  >
    <div class="confirmation-content">
      <!-- Заголовок -->
      <div class="confirmation-header">
        <h2 class="confirmation-title">{{ $t('appointment_confirmation_title') }}</h2>
      </div>

      <!-- Информация о записи -->
      <div class="confirmation-info">
        <div class="info-section">
          <div class="info-label">{{ $t('patient_label') }}</div>
          <div class="info-value">{{ patientData.name || "Не указано" }}</div>
          <div class="info-divider"></div>
        </div>

        <div class="info-section">
          <div class="info-label">{{ $t('appointment_label') }}</div>
          <div class="info-value">
            {{ doctor?.full_name }} ({{ doctor?.specialty }})
          </div>
          <div class="info-divider"></div>
        </div>

        <div class="info-section">
          <div class="info-label">{{ $t('date_time_label') }}</div>
          <div class="info-value">
            {{ formatDate(selectedDate) }} в {{ selectedTime }}
          </div>
          <div class="info-divider"></div>
        </div>

        <div class="info-section">
          <div class="info-label">{{ $t('cabinet_label') }}</div>
          <div class="info-value">{{ currentSchedule?.cabinet || `Каб. №${doctor?.cabinet}` }}</div>
          <div class="info-divider"></div>
        </div>

        <div class="info-section">
          <div class="info-label">{{ $t('institution_label') }}</div>
          <div class="info-value">{{ $t('city_clinic') }}</div>
          <div class="info-divider"></div>
        </div>

      </div>

      <!-- Инструкция -->
      <div class="confirmation-instruction">
        {{ $t('appointment_instruction_text') }}
      </div>

      <!-- Кнопка подтверждения -->
      <div class="confirmation-button-container">
        <div
          class="rounded-full bg-[#0C593E] text-white px-4 py-2 font-bold cursor-pointer max-w-xs mx-auto text-[16px] text-center approve"
          :class="{ 'opacity-50 cursor-not-allowed': isCreatingAppointment }"
          @click="confirmAppointment"
        >
          <span v-if="isCreatingAppointment">{{ $t('creating_appointment_text') }}</span>
          <span v-else>{{ $t('confirm_button') }}</span>
        </div>
      </div>

      <!-- Футер с кнопками -->
      <div class="confirmation-footer">
        <button class="footer-back-button" @click="cancelConfirmation">
          <span class="back-arrow">←</span>
          {{ $t('back_button_text') }}
        </button>
        <button class="footer-close-button" @click="cancelConfirmation">
          {{ $t('close_button_text') }}
        </button>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import dayjs, { Dayjs } from "dayjs";
import { notification } from "ant-design-vue";
import { createAppointment, type CreateAppointmentRequest } from "../api/appointments";
import { getScheduleSlots, type GetScheduleSlotsParams, type ScheduleWithSlots, type Schedule } from "../api/appointment";
import { useUserStore } from "../store/index";
import { useI18n } from "vue-i18n";

// Русские названия месяцев
const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];


interface Doctor {
  id: string;
  doctor_id: string;
  full_name: string;
  specialty: string;
  cabinet: string;
  schedule_string: string;
  post_id?: number;
  damu_post_id?: number;
  org_healthcare_id?: string;
  price_list_service_id?: number;
  clinic_id?: string;
  specialties?: Array<{
    id: string;
    doctor_id: string;
    clinic_specialty_id: string;
    is_active: boolean;
    created_date: string;
    updated_date: string;
    specialty: {
      id: string;
      name: string;
      name_kz?: string | null;
      description: string;
      description_kz?: string | null;
      damu_hPost_id?: number;
      is_active: boolean;
      created_at?: string | null;
      updated_at?: string | null;
    };
  }>;
  services?: Array<{
    id: string;
    doctor_id: string;
    clinic_id: string;
    service_price?: string | null;
    is_active: boolean;
    created_date: string;
    updated_date: string;
    clinic_service: {
      id: string;
      clinic_id: string;
      clinic_price: string;
      clinic_duration_minutes?: number | null;
      available_for_adults: boolean;
      available_for_children: boolean;
      covered_by_oms: boolean;
      installment_available: boolean;
      house_calls_available: boolean;
      damu_price_list_service_id?: number | null;
      damu_price_list_services_public_code?: string | null;
      clinic_notes?: string;
      is_available: boolean;
      service: {
        id: string;
        category_id?: string | null;
        name: string;
        name_kz?: string;
        description?: string;
        damu_typical_tarificator_id?: number;
        damu_price_list_service_id?: number;
        damu_price_list_services_public_code?: string;
        description_kz?: string;
        is_active: boolean;
        created_at?: string | null;
        updated_at?: string | null;
      };
    };
  }>;
  [key: string]: any; // For any additional fields
}

const props = defineProps<{
  visible: boolean;
  doctor: Doctor | null;
  org_healthcare_id?: string; // Organization ID (optional prop)
  post_id?: number; // Doctor post ID (optional prop, can be from doctor object)
  price_list_service_id?: number; // Service ID (optional prop)
  region?: string; // Region code, e.g., 'ast', 'alm' (optional prop, defaults to 'ast')
}>();

const emit = defineEmits(["update:visible", "booked"]);

const userStore = useUserStore();
const { t } = useI18n();

const selectedDate = ref<Dayjs | null>(dayjs()); // сегодня по умолчанию
const selectedTime = ref<string | null>(null);
const timeSlots = ref<any[]>([]);
const isLoadingSlots = ref(false);
const currentSchedule = ref<Schedule | null>(null); // Текущее расписание с данными о кабинете и т.д.

// Хранилище для всех загруженных слотов по датам
const allLoadedSlots = ref<Map<string, { schedule: Schedule | null; slots: any[] }>>(new Map());
const currentMonth = ref<Dayjs | null>(null); // Текущий месяц в календаре

// Модалка подтверждения
const showConfirmation = ref(false);
const patientData = ref({
  name: "",
  phone: "",
  email: "",
  notes: "",
});

// Состояние для создания записи
const isCreatingAppointment = ref(false);
const appointmentResult = ref<any>(null);
const appointmentError = ref<any>(null);

function handleClose() {
  emit("update:visible", false);
}

// Инициализация при открытии модалки
watch(
  () => props.visible,
  async (visible) => {
    if (visible && props.doctor?.doctor_id) {
      // Сбрасываем состояние
      allLoadedSlots.value.clear();
      selectedDate.value = dayjs();
      currentMonth.value = dayjs();
      selectedTime.value = null;
      
      // Загружаем данные за весь месяц (от сегодня до конца месяца)
      await loadMonthSlots();
      
      // Показываем слоты для выбранной даты (сегодня)
      filterSlotsByDate(selectedDate.value);
    }
  }
);

// Отслеживаем изменение месяца в календаре
watch(
  () => selectedDate.value,
  (date) => {
    if (!date) return;
    
    const newMonth = date.startOf('month');
    const oldMonth = currentMonth.value?.startOf('month');
    
    // Если месяц изменился, загружаем данные заново
    if (!oldMonth || !newMonth.isSame(oldMonth, 'month')) {
      currentMonth.value = newMonth;
      loadMonthSlots().then(() => {
        // После загрузки фильтруем слоты для выбранной даты
        filterSlotsByDate(date);
      });
    } else {
      // Если месяц не изменился, просто фильтруем данные
      filterSlotsByDate(date);
    }
  }
);

// Функция для генерации слотов времени на основе расписания врача
function generateTimeSlotsFromSchedule(doctor: Doctor | { id: string; name: string; specialty: string; schedule_string: string } | null, date: Dayjs) {
  if (!doctor) return [];

  // Получаем день недели (0 = воскресенье, 1 = понедельник, ..., 6 = суббота)
  const dayOfWeek = date.day();
  
  // Парсим расписание из schedule_string
  const scheduleString = doctor.schedule_string || '';
  
  // Если нет расписания, возвращаем пустой массив
  if (!scheduleString || scheduleString === 'По записи') {
    return [];
  }

  // Определяем рабочие часы на основе дня недели
  let startHour = 9;
  let endHour = 17;
  
  // Парсим расписание (пример: "пн. ср, пт 14:00-20:00; вт, чт 8:00-14:00")
  const scheduleParts = scheduleString.split(';');
  
  for (const part of scheduleParts) {
    const trimmedPart = part.trim();
    
    // Проверяем, подходит ли этот день недели
    if (isDayInSchedule(dayOfWeek, trimmedPart)) {
      const timeMatch = trimmedPart.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
      if (timeMatch && timeMatch[1] && timeMatch[3]) {
        startHour = parseInt(timeMatch[1]);
        endHour = parseInt(timeMatch[3]);
        break;
      }
    }
  }

  // Генерируем слоты времени
  const timeSlots = [];
  const slotDuration = 30; // 30 минут

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Проверяем, доступен ли слот (можно добавить логику проверки расписания)
      const isAvailable = true; // Пока все слоты доступны
      
      timeSlots.push({
        time: timeString,
        is_available: isAvailable
      });
    }
  }

  return timeSlots;
}

// Вспомогательная функция для проверки, подходит ли день недели к расписанию
function isDayInSchedule(dayOfWeek: number, schedulePart: string): boolean {
  const dayNames = {
    1: ['пн', 'понедельник'],
    2: ['вт', 'вторник'], 
    3: ['ср', 'среда'],
    4: ['чт', 'четверг'],
    5: ['пт', 'пятница'],
    6: ['сб', 'суббота'],
    0: ['вс', 'воскресенье']
  };

  const currentDayNames = dayNames[dayOfWeek as keyof typeof dayNames] || [];
  
  // Проверяем различные форматы расписания
  const lowerSchedule = schedulePart.toLowerCase();
  
  // Проверяем диапазоны дней (например, "пн-пт")
  if (dayOfWeek >= 1 && dayOfWeek <= 5) { // будние дни
    if (lowerSchedule.includes('пн-пт') || lowerSchedule.includes('понедельник-пятница')) {
      return true;
    }
  }
  
  // Проверяем конкретные дни
  return currentDayNames.some(dayName => 
    lowerSchedule.includes(dayName.toLowerCase())
  );
}

// Загружает данные за весь месяц (от сегодня до конца месяца)
async function loadMonthSlots() {
  if (!props.doctor || !selectedDate.value) {
    return;
  }

  // Проверяем наличие IIN
  if (!userStore.iin || userStore.iin.length !== 12) {
    console.warn('IIN is not available or invalid');
    return;
  }

  // Получаем необходимые параметры
  const postId = props.post_id 
    || props.doctor.post_id 
    || props.doctor.damu_post_id 
    || (props.doctor.doctor_id ? parseInt(props.doctor.doctor_id) : undefined);
  
  if (!postId) {
    console.error('post_id is not available for doctor:', props.doctor);
    return;
  }
  
  let priceListServiceId = props.price_list_service_id || props.doctor.price_list_service_id;
  if (!priceListServiceId && props.doctor.services && props.doctor.services.length > 0) {
    const firstService = props.doctor.services[0];
    priceListServiceId = firstService?.clinic_service?.damu_price_list_service_id || firstService?.clinic_service?.service?.damu_price_list_service_id;
  }
  if (!priceListServiceId) {
    priceListServiceId = 1;
  }
  
  let hPostId: number | undefined;
  if (props.doctor.specialties && props.doctor.specialties.length > 0) {
    hPostId = props.doctor.specialties[0]?.specialty?.damu_hPost_id;
  }
  
  const orgHealthcareId = String(props.doctor.clinic_info?.damu_org_health_care_id || '57000000000003651');
  const region = props.region || 'kos';

  // Формируем диапазон: от начала месяца (или сегодня, если это текущий месяц) до конца месяца
  const today = dayjs();
  const monthStart = selectedDate.value.startOf('month');
  const monthEnd = selectedDate.value.endOf('month');
  
  // Если это текущий месяц, начинаем с сегодня, иначе с начала месяца
  const beginDate = monthStart.isBefore(today) ? today : monthStart;
  const beginReceptionTime = beginDate.startOf('day').toISOString();
  const endReceptionTime = monthEnd.endOf('day').toISOString();

  try {
    isLoadingSlots.value = true;
    
    const params: GetScheduleSlotsParams = {
      begin_reception_time: beginReceptionTime,
      end_reception_time: endReceptionTime,
      iin: userStore.iin,
      org_healthcare_id: orgHealthcareId,
      post_id: postId,
      price_list_service_id: priceListServiceId,
      region: region,
      h_post_id: hPostId,
      is_pmsp: true,
      is_self_registration_payable: false,
      page_index: 0,
      page_size: 100, // Увеличиваем размер страницы для получения всех данных
    };

    const schedulesWithSlots: ScheduleWithSlots[] = await getScheduleSlots(params);
    
    // Очищаем предыдущие данные для текущего месяца
    allLoadedSlots.value.clear();
    
    // Обрабатываем данные и группируем по датам
    if (schedulesWithSlots && schedulesWithSlots.length > 0) {
      // Объединяем все расписания
      const allSchedules: ScheduleWithSlots[] = schedulesWithSlots;
      
      // Группируем слоты по датам
      allSchedules.forEach((scheduleWithSlots) => {
        if (scheduleWithSlots.schedule?.schedule_grid_cell && Array.isArray(scheduleWithSlots.schedule.schedule_grid_cell)) {
          scheduleWithSlots.schedule.schedule_grid_cell.forEach((cell: any) => {
            // Используем date_time_recept (новый формат) или reception_time (старый формат) для обратной совместимости
            const receptionTime = cell.date_time_recept || cell.reception_time;
            
            if (receptionTime) {
              const slotDate = dayjs(receptionTime);
              if (!slotDate || !slotDate.isValid()) return;
              
              const dateKey = slotDate.format('YYYY-MM-DD');
              
              if (!allLoadedSlots.value.has(dateKey)) {
                allLoadedSlots.value.set(dateKey, {
                  schedule: scheduleWithSlots.schedule,
                  slots: []
                });
              }
              
              const dateData = allLoadedSlots.value.get(dateKey);
              if (dateData) {
                // Извлекаем время из date_time_recept
                const time = slotDate.format('HH:mm');
                dateData.slots.push({
                  time: time,
                  is_available: cell.is_available !== false,
                  date_time_recept: cell.date_time_recept,
                  date_time_end_recept: cell.date_time_end_recept
                });
              }
            }
          });
        } else if (scheduleWithSlots.slots && scheduleWithSlots.slots.length > 0) {
          // Если слоты уже извлечены, группируем их по датам
          scheduleWithSlots.slots.forEach((slot: any) => {
            // Пытаемся найти дату в слоте (используем date_time_recept или reception_time)
            const receptionTime = slot.date_time_recept || slot.reception_time;
            const slotDate = receptionTime ? dayjs(receptionTime) : (selectedDate.value || dayjs());
            if (!slotDate || !slotDate.isValid()) return;
            
            const dateKey = slotDate.format('YYYY-MM-DD');
            
            if (!allLoadedSlots.value.has(dateKey)) {
              allLoadedSlots.value.set(dateKey, {
                schedule: scheduleWithSlots.schedule,
                slots: []
              });
            }
            
            const dateData = allLoadedSlots.value.get(dateKey);
            if (dateData) {
              dateData.slots.push(slot);
            }
          });
        }
      });
    }
    
    console.log('Loaded slots for month:', allLoadedSlots.value);
  } catch (e) {
    console.error('Error loading month slots from API:', e);
    allLoadedSlots.value.clear();
  } finally {
    isLoadingSlots.value = false;
  }
}

// Проверяет, есть ли доступные слоты для указанной даты
function hasAvailableSlots(date: Dayjs): boolean {
  if (!date) return false;
  
  const dateKey = date.format('YYYY-MM-DD');
  const dateData = allLoadedSlots.value.get(dateKey);
  
  if (!dateData || !dateData.slots || dateData.slots.length === 0) {
    return false;
  }
  
  // Проверяем, есть ли хотя бы один доступный слот
  return dateData.slots.some((slot: any) => slot.is_available !== false);
}

// Фильтрует уже загруженные слоты по выбранной дате
function filterSlotsByDate(date: Dayjs) {
  if (!date) {
    timeSlots.value = [];
    currentSchedule.value = null;
    selectedTime.value = null;
    return;
  }

  const dateKey = date.format('YYYY-MM-DD');
  const dateData = allLoadedSlots.value.get(dateKey);
  
  if (dateData) {
    currentSchedule.value = dateData.schedule;
    // Удаляем дубликаты слотов по времени и сортируем
    const uniqueSlots = new Map<string, any>();
    dateData.slots.forEach((slot: any) => {
      if (slot.time && !uniqueSlots.has(slot.time)) {
        uniqueSlots.set(slot.time, slot);
      }
    });
    
    // Сортируем слоты по времени
    timeSlots.value = Array.from(uniqueSlots.values()).sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });
  } else {
    currentSchedule.value = null;
    timeSlots.value = [];
  }
  
  selectedTime.value = null;
}

function handleMonthChange(direction: number) {
  if (!selectedDate.value) return;
  
  const newDate = selectedDate.value.add(direction, 'month');
  const newMonth = newDate.startOf('month');
  const oldMonth = currentMonth.value?.startOf('month');
  
  // Обновляем выбранную дату
  selectedDate.value = newDate;
  
  // Если месяц изменился, загружаем данные заново
  if (!oldMonth || !newMonth.isSame(oldMonth, 'month')) {
    currentMonth.value = newMonth;
    loadMonthSlots().then(() => {
      // После загрузки фильтруем слоты для новой даты
      filterSlotsByDate(newDate);
    });
  } else {
    // Если месяц не изменился, просто фильтруем данные
    filterSlotsByDate(newDate);
  }
}

function selectDate(current: Dayjs) {
  // Разрешаем выбор любой даты в будущем
  if (current.isAfter(dayjs().startOf("day")) || current.isSame(dayjs().startOf("day"))) {
    selectedDate.value = current;
    // Фильтруем слоты для выбранной даты (не вызываем API)
    filterSlotsByDate(current);
  }
}

function disabledDate(current: Dayjs) {
  return current && current < dayjs().startOf("day");
}

// Функция для получения заголовка месяца и года на русском языке
function getMonthYearTitle(value: Dayjs) {
  const month = monthNames[value.month()];
  const year = value.year();
  return `${month} ${year}`;
}

function bookAppointment() {
  if (!selectedDate.value || !selectedTime.value || !props.doctor) return;

  // Предзаполняем данные пациента (можно получить из localStorage или других источников)
  patientData.value = {
    name: "Амандыков Алмаз", // Пример данных
    phone: "+7 777 123-45-67",
    email: "almaz@email.com",
    notes: "",
  };

  showConfirmation.value = true;
}

// Вспомогательная функция для получения параметров доктора
function getDoctorParams() {
  if (!props.doctor) {
    return null;
  }

  // Получаем необходимые параметры
  const postId = props.post_id 
    || props.doctor.post_id 
    || props.doctor.damu_post_id 
    || (props.doctor.doctor_id ? parseInt(props.doctor.doctor_id) : undefined);
  
  if (!postId) {
    console.error('post_id is not available for doctor:', props.doctor);
    return null;
  }
  
  let priceListServiceId = props.price_list_service_id || props.doctor.price_list_service_id;
  if (!priceListServiceId && props.doctor.services && props.doctor.services.length > 0) {
    const firstService = props.doctor.services[0];
    priceListServiceId = firstService?.clinic_service?.damu_price_list_service_id || firstService?.clinic_service?.service?.damu_price_list_service_id;
  }
  if (!priceListServiceId) {
    priceListServiceId = 1;
  }
  
  const orgHealthcareId = String(
    props.org_healthcare_id
    || props.doctor.clinic_info?.damu_org_health_care_id 
    || '57000000000003651'
  );
  
  const region = props.region || 'kos';

  return {
    post_id: postId,
    price_list_service_id: priceListServiceId,
    org_healthcare_id: orgHealthcareId,
    region: region
  };
}

async function confirmAppointment() {
  if (!selectedDate.value || !selectedTime.value || !props.doctor) {
    console.error('Ошибка: не выбран доктор');
    return;
  }

  // Проверяем наличие IIN
  if (!userStore.iin || userStore.iin.length !== 12) {
    console.error('IIN is not available or invalid');
    return;
  }

  // Получаем параметры доктора
  const doctorParams = getDoctorParams();
  if (!doctorParams) {
    console.error('Не удалось получить параметры доктора');
    return;
  }

  // Находим выбранный слот для получения точного времени
  const selectedSlot = timeSlots.value.find(slot => slot.time === selectedTime.value);
  
  // Формируем desired_time_reception в формате ISO
  let desiredTimeReception: string;
  if (selectedSlot?.date_time_recept) {
    // Используем точное время из слота, если доступно
    desiredTimeReception = selectedSlot.date_time_recept;
  } else {
    // Формируем из selectedDate и selectedTime
    const timeParts = selectedTime.value.split(':');
    const hours = timeParts[0] || '0';
    const minutes = timeParts[1] || '0';
    const dateTime = selectedDate.value
      .hour(parseInt(hours))
      .minute(parseInt(minutes))
      .second(0)
      .millisecond(0);
    desiredTimeReception = dateTime.toISOString();
  }
  
  const appointmentData: CreateAppointmentRequest = {
    iin: userStore.iin,
    grid_schedule_id: currentSchedule.value?.grid_schedule_id?.toString() || '',
    desired_time_reception: desiredTimeReception,
    problem: patientData.value.notes || "Запись с терминала", // Используем заметки из patientData или пустую строку
    post_id: doctorParams.post_id,
    price_list_service_id: doctorParams.price_list_service_id,
    org_healthcare_id: doctorParams.org_healthcare_id,
    region: doctorParams.region,
  };
  
  try {
    isCreatingAppointment.value = true;
    appointmentError.value = null;
    
    const response = await createAppointment(appointmentData);
    
    // Проверяем, что ответ успешный (статус 201)
    if (!response || response.success === false) {
      throw new Error(response?.message || 'Failed to create appointment');
    }
    
    appointmentResult.value = true;
    
    // Эмитим событие с результатом только при успехе
    emit("booked", {
      doctorId: props.doctor.doctor_id,
      date: selectedDate.value.format("YYYY-MM-DD"),
      time: selectedTime.value,
      patientData: patientData.value,
      appointmentResult: true, // true означает успех
    });
    
    // Закрываем модалку подтверждения
    showConfirmation.value = false;
    // Закрываем основную модалку
    handleClose();
    
  } catch (error: any) {
    appointmentError.value = error;
    
    // Показываем ошибку пользователю
    notification.error({
      message: t('appointment_failed_title'),
      duration: 5,
    });
    
    // НЕ эмитим событие "booked" при ошибке - не открываем ApprovePage
    // НЕ закрываем модалку подтверждения - пользователь может попробовать снова
  } finally {
    // Всегда сбрасываем флаг создания в finally
    isCreatingAppointment.value = false;
  }
}

function cancelConfirmation() {
  showConfirmation.value = false;
}

function formatDate(date: Dayjs | null) {
  if (!date) return "";

  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  const day = date.date();
  const month = months[date.month()];
  const year = date.year();

  return `${day} ${month} ${year}`;
}
</script>

<style scoped>
:deep(.ant-modal-body) {
  padding: 20px !important;
}
:deep(.ant-modal-header) {
  padding: 0 !important;
  justify-content: center;
}
:deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

/* Исправляем проблемы с выравниванием для всех экранов */
.time-slot {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
}

.available-slot,
.unavailable-slot,
.selected-slot {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
}

.custom-green-btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 2 !important;
  padding: 20px 30px !important;
}

.custom-green-btn .text-white {
  line-height: 2 !important;
  padding: 20px 30px !important;
}

/* Внутренняя обёртка — тут ты сама задаёшь нужный padding */
.modal-inner {
  background: transparent;
}
.custom-green-btn {
  background-color: #0c593e !important;
  border-color: #0c593e !important;
  color: #fff !important;
  font-weight: bold;
  border-radius: 20px;
}
.time-slot {
  min-width: 100px;
  text-align: center;
}

.available-slot {
  background-color: #11ae78 !important;
  border-color: #11ae78 !important;
  color: #fff !important;
}
.unavailable-slot {
  background-color: #f5f5f5 !important;
  border-color: #d9d9d9 !important;
  color: #999 !important;
  cursor: not-allowed !important;
}
.selected-slot {
  background-color: #11ae78 !important;
  border-color: #11ae78 !important;
  color: #fff !important;
  font-weight: bold !important;
}
.mini-calendar {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  flex: 1;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 640px) {
  .calendar-wrapper {
    gap: 8px;
    max-width: 100%;
  }
  
  .mini-calendar {
    max-width: 350px;
  }
  
  .calendar-nav-arrow {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}

/* Стили для больших экранов (4K) */
@media (min-width: 2560px) and (min-height: 1440px) {
  /* Исправляем слоты времени - переопределяем глобальные стили */
  .schedule-modal .time-slot {
    min-width: 100px !important;
    height: 50px !important;
    font-size: 18px !important;
    font-weight: 600 !important;
    padding: 12px 16px !important;
    border-radius: 12px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
  }
  
  .schedule-modal .available-slot {
    background-color: #11ae78 !important;
    border-color: #11ae78 !important;
    color: #fff !important;
    font-size: 18px !important;
    font-weight: 600 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
  }
  
  .schedule-modal .unavailable-slot {
    background-color: #f5f5f5 !important;
    border-color: #d9d9d9 !important;
    color: #999 !important;
    cursor: not-allowed !important;
    font-size: 18px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
  }
  
  .schedule-modal .selected-slot {
    background-color: #11ae78 !important;
    border-color: #11ae78 !important;
    color: #fff !important;
    font-weight: bold !important;
    font-size: 18px !important;
    transform: scale(1.05) !important;
    box-shadow: 0 4px 12px rgba(17, 174, 120, 0.3) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
  }
  
  /* Увеличиваем контейнер для слотов времени */
  .schedule-modal .mb-4.max-w-md {
    max-width: 800px !important;
  }
  
  /* Увеличиваем gap между слотами */
  .schedule-modal .flex.flex-wrap.gap-1 {
    gap: 12px !important;
  }
  
  /* Увеличиваем размер модалки */
  .schedule-modal {
    width: 800px !important;
  }
  
  /* Увеличиваем размер календаря */
  .schedule-modal .mini-calendar {
    max-width: 600px !important;
  }
  
  /* Увеличиваем стрелки навигации */
  .schedule-modal .calendar-nav-arrow {
    width: 50px !important;
    height: 50px !important;
    font-size: 20px !important;
  }
  
  /* Увеличиваем заголовок времени */
  .schedule-modal .font-semibold.mb-2.text-center {
    font-size: 20px !important;
    margin-bottom: 16px !important;
  }
  
  /* Стили для модалки подтверждения на 4K */
  .confirmation-modal {
    width: 700px !important;
  }
  
  .confirmation-modal .confirmation-title {
    font-size: 28px !important;
  }
  
  .confirmation-modal .info-label {
    font-size: 16px !important;
  }
  
  .confirmation-modal .info-value {
    font-size: 18px !important;
  }
  
  .confirmation-modal .confirmation-instruction {
    font-size: 16px !important;
    padding: 20px 24px !important;
  }
  
  .confirmation-modal .confirmation-button {
    font-size: 18px !important;
    padding: 20px 40px !important;
    max-width: 300px !important;
  }
  
  .confirmation-modal .footer-back-button,
  .confirmation-modal .footer-close-button {
    font-size: 16px !important;
    padding: 12px 20px !important;
  }
  
  /* Стили для кнопки "Записаться" на 4K */
  .schedule-modal .custom-green-btn {
    font-size: 20px !important;
    padding: 16px 32px !important;
    min-height: 60px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
  }
  
  .schedule-modal .custom-green-btn .text-white {
    font-size: 20px !important;
    padding: 0 8px !important;
    line-height: 1 !important;
  }
}

/* фон календаря */
:deep(.ant-picker-panel) {
  background-color: #e8f4f2 !important;
  border-radius: 12px;
}

/* Стили для селектора года/месяца */
:deep(.ant-picker-header) {
  background-color: white !important;
  padding: 8px 12px !important;
}

:deep(.ant-picker-header-view) {
  color: #11ae78 !important;
  font-weight: bold !important;
  font-size: 16px !important;
}

:deep(.ant-picker-header-super-prev-btn),
:deep(.ant-picker-header-prev-btn),
:deep(.ant-picker-header-next-btn),
:deep(.ant-picker-header-super-next-btn) {
  color: #11ae78 !important;
  font-size: 16px !important;
}

:deep(.ant-picker-header-super-prev-btn:hover),
:deep(.ant-picker-header-prev-btn:hover),
:deep(.ant-picker-header-next-btn:hover),
:deep(.ant-picker-header-super-next-btn:hover) {
  color: #0c593e !important;
}

/* Кастомный заголовок календаря */
.calendar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  background-color: white;
  border-radius: 12px 12px 0 0;
}

.calendar-title {
  color: #11ae78;
  font-weight: bold;
  font-size: 16px;
}

/* Обертка календаря с стрелками */
.calendar-wrapper {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 16px;
  max-width: 500px;
  margin: 0 auto;
}

/* Стрелки навигации снаружи календаря */
.calendar-nav-arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.left-arrow {
  background-color: #f5f5f5;
  color: #666;
}

.left-arrow:hover {
  background-color: #e0e0e0;
  transform: scale(1.05);
}

.right-arrow {
  background-color: #11ae78;
  color: white;
}

.right-arrow:hover {
  background-color: #0f9d6b;
  transform: scale(1.05);
}

.calendar-nav-arrow:active {
  transform: scale(0.95);
}

/* Стили для дней недели */
:deep(.ant-picker-calendar-date-panel) {
  background-color: #e8f4f2;
}

:deep(.ant-picker-calendar-date-panel .ant-picker-cell) {
  color: #11ae78;
  font-weight: 500;
}

/* Стили для заголовков дней недели */
:deep(.ant-picker-calendar-date-panel .ant-picker-calendar-date-panel .ant-picker-cell-inner) {
  color: #11ae78;
  font-weight: 600;
}

/* Кастомные заголовки дней недели */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  margin-top: 8px;
  background-color: #e8f4f2;
  border-radius: 0 0 12px 12px;
  padding: 8px 0;
}

.weekday-header {
  text-align: center;
  padding: 8px 4px;
  color: #11ae78;
  font-weight: 600;
  font-size: 14px;
}

.weekday-header.weekend {
  color: #7dd3a0;
}

/* Стили для выпадающих списков года/месяца */
:deep(.ant-picker-dropdown) {
  background-color: #e8f4f2 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

:deep(.ant-picker-dropdown .ant-picker-panel) {
  background-color: #e8f4f2 !important;
  border-radius: 12px !important;
}

:deep(.ant-picker-dropdown .ant-picker-cell) {
  color: #333 !important;
}

:deep(.ant-picker-dropdown .ant-picker-cell:hover) {
  background-color: rgba(17, 174, 120, 0.1) !important;
  color: #11ae78 !important;
}

:deep(.ant-picker-dropdown .ant-picker-cell-selected) {
  background-color: #11ae78 !important;
  color: white !important;
}

:deep(.ant-picker-dropdown .ant-picker-cell-selected:hover) {
  background-color: #0c593e !important;
  color: white !important;
}

/* ячейки дней */
:deep(.ant-picker-cell) {
  background-color: transparent !important;
}

/* выбранный день */
:deep(.ant-picker-cell-selected .ant-picker-cell-inner),
:deep(.ant-picker-cell-selected .ant-picker-calendar-date) {
  background-color: #11ae78 !important;
  color: #fff !important;
  font-weight: bold;
  border-radius: 50%;
}

/* Стили для дат со слотами */
.date-with-slots {
  border: 2px solid #11ae78 !important;
  font-weight: 600 !important;
}

.date-with-slots:hover {
  background-color: #d1f3e5 !important;
  border-color: #0c593e !important;
}

/* hover по дням */
:deep(.ant-picker-cell-inner:hover),
:deep(.ant-picker-calendar-date:hover) {
  background-color: #d1f3e5 !important;
  border-radius: 50%;
}

/* Стили для селекта врача */


:deep(.ant-select-selector) {
  border-radius: 8px !important;
  border-color: #11ae78 !important;
}

:deep(.ant-select-focused .ant-select-selector) {
  border-color: #11ae78 !important;
  box-shadow: 0 0 0 2px rgba(17, 174, 120, 0.2) !important;
}

/* Стили для модалки подтверждения */
.confirmation-content {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.confirmation-header {
  padding: 24px 24px 16px 24px;
}
:deep(.ant-picker-calendar .ant-picker-calendar-header) {
    display: flex
;
    justify-content: center;
    padding: 12px 0;
}
.confirmation-title {
  font-size: 24px;
  font-weight: bold;
  color: #11ae78;
  margin: 0;
}
.no-padding-modal .ant-modal-body {
  padding: 0 !important;
}

.confirmation-info {
  padding: 0 24px;
}

.info-section {
  margin-bottom: 16px;
}

.info-label {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
}

.info-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 8px 0;
}

.confirmation-instruction {
  padding: 16px 24px;
  font-size: 14px;
  color: #9ca3af;
  line-height: 1.5;
}

.confirmation-button-container {
  padding: 24px;
  text-align: center;
}

.confirmation-button {
  background-color: #0c593e;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  max-width: 200px;
}

.confirmation-button:hover {
  background-color: #0a4a33;
}

.confirmation-footer {
  background-color: #e8f4f2;
  padding: 16px 24px;
  display: flex;
  gap: 12px;
}

.footer-back-button {
  background: linear-gradient(135deg, #0c593e 0%, #11ae78 100%);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.footer-back-button:hover {
  background: linear-gradient(135deg, #0a4a33 0%, #0f9d6b 100%);
}

.back-arrow {
  font-size: 16px;
}

.footer-close-button {
  background-color: white;
  color: #11ae78;
  border: 2px solid #11ae78;
  border-radius: 20px;
  padding: 8px 8px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}
.ant-modal .ant-modal-content {
  padding: 0 !important;
}

.footer-close-button:hover {
  background-color: #f0fdf4;
}
</style>
