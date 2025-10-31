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
      <div v-if="doctor && !isPaidService" class="text-center mb-4 p-8">
        <div class="font-bold text-lg">{{ doctor.full_name }}</div>
        <div class="text-green-600">
          {{ doctor.specialty }} / Каб. №{{ doctor.cabinet }}
        </div>
        <div class="text-gray-500 text-sm text-center">
          {{ $t('working_hours_monday') }}<br/>
          {{ $t('working_hours_tuesday') }}
        </div>
      </div>

      <!-- Селект врача для платных услуг -->
      <div v-if="doctor && isPaidService" class="mb-4 p-4 bg-gray-50 rounded-lg text-center flex flex-col items-center justify-center">
        <div class="font-bold text-lg text-[#11AE78] mb-4">{{ doctor.full_name }}</div>
        <div class="font-semibold mb-2 text-center text-gray-700">{{ $t('select_doctor') }}</div>
        <a-select
          v-model:value="selectedDoctorForPaid"
          :placeholder="$t('select_doctor_placeholder')"
          class="w-full max-w-md mx-auto"
          size="large"
          @change="onDoctorChange"
        >
          <a-select-option
            v-for="doctor in availableDoctors"
            :key="doctor.id"
            :value="doctor.id"
          >
            {{ doctor.name }} - {{ doctor.specialty }}
          </a-select-option>
        </a-select>
      </div>

      <!-- Календарь -->
      <div class="mb-4">
        <div class="font-semibold mb-2 text-center">{{ $t('select_appointment_date') }}</div>
        <div class="calendar-wrapper">
          <!-- Левая стрелка -->
          <button 
            class="calendar-nav-arrow left-arrow"
            @click="() => selectedDate && (selectedDate = selectedDate.subtract(1, 'month'))"
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
                  'w-8 h-8 flex items-center justify-center rounded-full cursor-pointer',
                  selectedDate && current.isSame(selectedDate, 'day')
                    ? 'bg-[#11AE78] text-white font-bold'
                    : 'hover:bg-gray-100',
                ]"
                @click="() => selectDate(current)"
              >
                {{ current.date() }}
              </div>
            </template>
          </a-calendar>
          
          <!-- Правая стрелка -->
          <button 
            class="calendar-nav-arrow right-arrow"
            @click="() => selectedDate && (selectedDate = selectedDate.add(1, 'month'))"
          >
            →
          </button>
        </div>
      </div>

      <!-- Время приёма -->
      <div v-if="timeSlots.length" class="mb-4 max-w-md mx-auto">
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

      <!-- Записаться -->
      <div class="text-center flex items-center justify-center ">
        <a-button
          type="primary"
          class="custom-green-btn px-8 py-6"
          :disabled="!selectedDate || !selectedTime || (isPaidService && !selectedDoctorForPaid)"
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
            <template v-if="isPaidService">
              {{ selectedPaidService?.full_name }} ({{ selectedPaidService?.specialty }})
              <br>
              <span class="text-sm text-gray-500">
                Врач: {{ availableDoctors.find(d => d.id === selectedDoctorForPaid)?.name }}
              </span>
            </template>
            <template v-else>
              {{ doctor?.full_name }} ({{ doctor?.specialty }})
            </template>
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
          <div class="info-value">Каб. №{{ doctor?.cabinet }}</div>
          <div class="info-divider"></div>
        </div>

        <div class="info-section">
          <div class="info-label">{{ $t('institution_label') }}</div>
          <div class="info-value">{{ $t('city_clinic') }}</div>
          <div class="info-divider"></div>
        </div>

        <!-- Информация о стоимости для платных услуг -->
        <div v-if="isPaidService && selectedPaidService" class="info-section">
          <div class="info-label">{{ $t('cost_label') }}</div>
          <div class="info-value">
            <div class="text-green-600 font-bold">
              {{ $t('first_visit_price') }} {{ selectedPaidService.first_price }} ₸
            </div>
            <div class="text-gray-600 text-sm">
              {{ $t('follow_up_price') }} {{ selectedPaidService.next_price }} ₸
            </div>
          </div>
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
          :class="{ 'opacity-50 cursor-not-allowed': isCreatingAppointment && !isPaidService }"
          @click="confirmAppointment"
        >
          <span v-if="isCreatingAppointment && !isPaidService">{{ $t('creating_appointment_text') }}</span>
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
import { ref, watch, onMounted } from "vue";
import dayjs, { Dayjs } from "dayjs";
import { createAppointment, type CreateAppointmentRequest } from "../api/appointments";

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
  type?: "oms" | "paid";
}

const props = defineProps<{
  visible: boolean;
  doctor: Doctor | null;
  isPaidService?: boolean;
  selectedPaidService?: any;
}>();

const emit = defineEmits(["update:visible", "booked"]);


const selectedDate = ref<Dayjs | null>(dayjs()); // сегодня по умолчанию
const selectedTime = ref<string | null>(null);
const timeSlots = ref<any[]>([]);
const selectedDoctorForPaid = ref<string | null>(null);

// Мок-данные врачей для платных услуг
const availableDoctors = ref([
  { 
    id: "1", 
    name: "Доктор Ахметов А.А.", 
    specialty: "Хирург",
    schedule_string: "пн, ср, пт 9:00-17:00; вт, чт 8:00-14:00"
  },
  { 
    id: "2", 
    name: "Доктор Смирнова Е.В.", 
    specialty: "Окулист",
    schedule_string: "пн-пт 9:00-18:00"
  },
  { 
    id: "3", 
    name: "Доктор Козлов И.П.", 
    specialty: "Кардиолог",
    schedule_string: "пн, вт, ср 10:00-16:00; чт, пт 9:00-15:00"
  },
  { 
    id: "4", 
    name: "Доктор Петрова М.С.", 
    specialty: "Невролог",
    schedule_string: "пн-ср 8:00-14:00; чт, пт 14:00-20:00"
  }
]);

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

function onDoctorChange(doctorId: string) {
  selectedDoctorForPaid.value = doctorId;
  // Сбрасываем время при смене врача
  selectedTime.value = null;
  timeSlots.value = [];
  
  // Загружаем слоты для выбранного врача и даты
  if (selectedDate.value) {
    loadTimeSlots(selectedDate.value);
  }
}

// Загружаем слоты времени при открытии модалки
onMounted(async () => {
  selectedDoctorForPaid.value = '1';
});

// Загружаем слоты времени при появлении доктора
watch(
  () => props.doctor,
  async (doctor) => {
    if (doctor?.id && selectedDate.value) {
   
      await loadTimeSlots(selectedDate.value);
    }
  },
  { immediate: true }
);

// Следим за изменением visible
watch(
  () => props.visible,
  async (visible) => {
    if (visible && props.doctor?.doctor_id && selectedDate.value) {
      await loadTimeSlots(selectedDate.value);
    }
  }
);

// Дополнительный watcher для комбинации visible и doctor
watch([() => props.visible, () => props.doctor], async ([visible, doctor]) => {
  if (visible && doctor?.doctor_id && selectedDate.value) {
    await loadTimeSlots(selectedDate.value);
  }
});

// Загружаем слоты времени при выборе даты
watch(selectedDate, async (date) => {
  if (!date) {
   
    return;
  }

  if (!props.doctor?.doctor_id) {
  
    return;
  }

  await loadTimeSlots(date);
});

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

async function loadTimeSlots(date: Dayjs) {
  // Для платных услуг нужен выбранный врач
  if (props.isPaidService && !selectedDoctorForPaid.value) {
    timeSlots.value = [];
    return;
  }

  // Для ОСМС нужен doctor
  if (!props.isPaidService && !props.doctor) {
    timeSlots.value = [];
    return;
  }

  try {
    let doctor = null;

    // Для платных услуг используем данные из availableDoctors
    if (props.isPaidService && selectedDoctorForPaid.value) {
      doctor = availableDoctors.value.find(d => d.id === selectedDoctorForPaid.value);
    } else if (!props.isPaidService) {
      // Для ОСМС используем переданного врача
      doctor = props.doctor;
    }

    if (!doctor) {
      timeSlots.value = [];
      return;
    }

    // Генерируем слоты времени на основе расписания врача
    const generatedSlots = generateTimeSlotsFromSchedule(doctor, date);
    timeSlots.value = generatedSlots;
    selectedTime.value = null;
  } catch (e) {
    console.error('Error generating time slots:', e);
    timeSlots.value = [];
  }
}

function selectDate(current: Dayjs) {
  // Разрешаем выбор любой даты в будущем
  if (current.isAfter(dayjs().startOf("day"))) {
    selectedDate.value = current;
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

async function confirmAppointment() {
  if (!selectedDate.value || !selectedTime.value) return;
  
  // Для платных услуг нужен выбранный врач
  if (props.isPaidService && !selectedDoctorForPaid.value) {
    console.warn('Пожалуйста, выберите врача');
    return;
  }
  
  // Для ОСМС нужен доктор
  if (!props.isPaidService && !props.doctor) {
    console.error('Ошибка: не выбран доктор');
    return;
  }
  
  let doctorId: string;
  
  if (props.isPaidService) {
    doctorId = selectedDoctorForPaid.value!;
  } else {
    doctorId = props.doctor!.doctor_id;
  }
  
  // Для платных услуг не отправляем запрос на API, сразу показываем результат
  if (props.isPaidService) {
    
    // Создаем мок-результат для платной услуги
    const mockResult = {
      id: Date.now(), // Генерируем уникальный ID
      date: selectedDate.value.format("YYYY-MM-DD"),
      time: selectedTime.value,
      doctor_id: parseInt(doctorId),
      patient_code: 1001,
      status: "confirmed",
      is_paid_service: true,
      service_name: props.selectedPaidService?.full_name || "Платная услуга",
      price: props.selectedPaidService?.first_price || 0
    };
    
    appointmentResult.value = true; // Успех для платной услуги
    
    // Эмитим событие с результатом
    emit("booked", {
      doctorId: doctorId,
      date: selectedDate.value.format("YYYY-MM-DD"),
      time: selectedTime.value,
      patientData: patientData.value,
      appointmentResult: true, // true означает успех
      isPaidService: props.isPaidService,
      selectedPaidService: props.selectedPaidService,
      mockResult: mockResult // Дополнительная информация о результате
    });
    
    // Закрываем модалку подтверждения
    showConfirmation.value = false;
    // Закрываем основную модалку
    handleClose();
    
    return;
  }
  
  // Для ОСМС отправляем запрос на API
  const appointmentData: CreateAppointmentRequest = {
    date: selectedDate.value.format("YYYY-MM-DD"),
    doctor_id: parseInt(doctorId),
    patient_code: 1001, // Используем дефолтный код пациента
    time: selectedTime.value,
  };
  
  try {
    isCreatingAppointment.value = true;
    appointmentError.value = null;
    
    await createAppointment(appointmentData);
    
    appointmentResult.value = true;
    
    // Эмитим событие с результатом
    emit("booked", {
      doctorId: doctorId,
      date: selectedDate.value.format("YYYY-MM-DD"),
      time: selectedTime.value,
      patientData: patientData.value,
      appointmentResult: true, // true означает успех
      isPaidService: props.isPaidService,
      selectedPaidService: props.selectedPaidService
    });
    
    // Закрываем модалку подтверждения
    showConfirmation.value = false;
    // Закрываем основную модалку
    handleClose();
    
  } catch (error) {
    appointmentError.value = error;
    
    // Даже при ошибке показываем ApprovePage как успех
    appointmentResult.value = true; // Всегда показываем как успех
    
    // Эмитим событие с результатом (всегда успех)
    emit("booked", {
      doctorId: doctorId,
      date: selectedDate.value.format("YYYY-MM-DD"),
      time: selectedTime.value,
      patientData: patientData.value,
      appointmentResult: true, // Всегда true - показываем как успех
      isPaidService: props.isPaidService,
      selectedPaidService: props.selectedPaidService,
      error: error // Передаем информацию об ошибке для отладки
    });
    
    // Закрываем модалку подтверждения
    showConfirmation.value = false;
    // Закрываем основную модалку
    handleClose();
  } finally {
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
