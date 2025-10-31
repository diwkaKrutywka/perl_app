<template>
    <div class="text-center mb-6 p-4 flex-shrink-0 mt-22">
      <!-- Если ИИН нет -->
      <div v-if="!iin">
        <span class="text-[#11AE78] font-bold text-[1.2rem] mb-6">
          {{ $t('appointment_title') }} <br />
        </span>

        <span class="text-black  text-[1rem] mb-4 font-semibold my-6" v-html="$t('appointment_description')">
        </span>

        <!-- Поле перехода на авторизацию -->
        <div
          class="w-full max-w-lg min-w-[300px] mx-auto py-3 px-8 bg-gray-200 rounded-[1.2rem] mt-4 cursor-pointer iin"
          @click="openAuthPage"
        >
          <span class="text-black text-lg lg:text-xl mb-2 font-bold">
            {{ $t('iin_label') }}
          </span>
        </div>
      </div>
  
      <!-- Если ИИН уже есть -->
      <div v-else>
        <span class="text-[#11AE78] font-bold text-[1.2rem] mb-6">
          {{ $t('appointment_title') }} <br />
        </span>

        <div class=" mt-2 px-6 ">
          <span class="text-black text-[1.25rem] font-bold">
            {{ $t('iin_value') }} {{ iin }}
          </span>
          <div class="text-sm text-gray-600 font-medium">{{ $t('patient_section') }}</div>
        </div>

      
        
     

        <div
          class="mt-4 bg-[#0C593E] text-white px-3 iin py-3 rounded-3xl shadow-lg hover:bg-[#0A4A32] max-w-xs mx-auto font-bold text-base transition-all duration-200 hover:shadow-xl cursor-pointer"
          @click="openTherapistSchedule"
        >
          {{ $t('book_therapist') }}
        </div>
      </div>
    </div>
    
    <!-- SchedulePage для записи к терапевту -->
    <SchedulePage 
      v-model:visible="visible" 
      :doctor="doctor" 
      :is-paid-service="isPaidService"
      :selected-paid-service="selectedPaidService"
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
  </template>
  
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useUserStore } from "../store/index";
import { useI18n } from "vue-i18n";
import { useSoundControl } from "../composables/useSoundControl";
import SchedulePage from "../components/SchedulePage.vue";
import ApprovePage from "../components/ApprovePage.vue";
import { DoctorsApi, type Doctor } from "../api/doctors";

const { t: $t } = useI18n();

const router = useRouter();
const userStore = useUserStore();
const { iin } = storeToRefs(userStore); // реактивный доступ к iin
const { enableSound } = useSoundControl();


// Состояние для SchedulePage
const visible = ref(false);
const doctor = ref<Doctor | null>(null);
const isPaidService = ref(false);
const selectedPaidService = ref(null);

// Состояние для ApprovePage
const showApprovePage = ref(false);
const appointmentResult = ref<any>(null);

const openAuthPage = () => {
  router.push("/auth-page");
};

// Функция для получения терапевта
const getTherapist = async () => {
  try {
    // Ищем терапевта по специальности (обычно это specialty_id = 1 или название "Терапевт")
    const params = { specialty_id: "1", clinic_id: "3" };
    const res = await DoctorsApi("", params, "GET");
    const payload = res?.data ?? res;
    
    const doctors = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.doctors)
      ? payload.doctors
      : payload.items ?? [];
    
    // Берем первого терапевта
    if (doctors.length > 0) {
      return doctors[0];
    }
    
    // Если не нашли по specialty_id, попробуем найти по названию
    const therapistByName = doctors.find((d: Doctor) => 
      d.specialty.toLowerCase().includes('терапевт') || 
      d.specialty.toLowerCase().includes('therapist')
    );
    
    return therapistByName || null;
  } catch (error) {
    return null;
  }
};

// Функция для открытия расписания терапевта
const openTherapistSchedule = async () => {
  if (!iin.value || iin.value.length !== 12) {
    router.push("/auth-page");
    return;
  }
  
  const therapist = await getTherapist();
  if (therapist) {
    doctor.value = therapist;
    isPaidService.value = false;
    selectedPaidService.value = null;
    visible.value = true;
  } else {
    // Можно показать уведомление пользователю
  }
};

// Обработчик события записи
const handleAppointmentBooked = (appointmentInfo: any) => {
  appointmentResult.value = appointmentInfo.appointmentResult;
  showApprovePage.value = true;
};

// Функция закрытия ApprovePage
const closeApprovePage = () => {
  showApprovePage.value = false;
  appointmentResult.value = null;
  // Сбрасываем ИИН при закрытии ApprovePage
  userStore.clearIin();
  // Сбрасываем звук на первоначальные настройки
  enableSound();

  // Закрываем модалку расписания
  visible.value = false;
};
  </script>
  