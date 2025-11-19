<template>
  <div
    class="h-screen bg-gradient-to-b from-[#E8F4F2] to-white flex flex-col overflow-hidden"
  >


    <!-- Видео в правом верху (скрыто во время глобальной анимации) -->
    <div
      class="auth-video-container fixed z-50"
      :class="{ 'hidden-during-animation': isGlobalAnimating }"
      :style="{ top: '0.5rem', right: '1rem' }"
    >
      <UnifiedVideo 
        position="top-right" 
        :enable-rotation="true"
        instance-id="auth-top-right"
        page-type="checkin"
      />
    </div>

    <!-- Контент -->
    <main class="flex-1 flex flex-col bg-white overflow-hidden">
      <div
        class="flex flex-col bg-white m-auto w-full max-w-sm sm:max-w-md lg:max-w-lg px-4"
      >
        <span class="text-[#11AE78] text-[1.2rem] font-bold mb-2 text-center">
          {{ $t('auth_title') }}
        </span>

        <p class="text-gray-700 font-medium mb-4 text-center text-[1rem]" v-html="$t('auth_description')">
        </p>

        <!-- Поле для ИИН -->
        <div class="w-full mb-4">
          <input
            v-model="iin"
            type="text"
            :class="[
              'w-full text-center text-base sm:text-lg rounded-2xl py-3 font-bold text-black',
              iinError ? 'bg-red-100 border-2 border-red-400' : 'bg-[#E0E0E0]'
            ]"
            readonly
          />
          <!-- Сообщение об ошибке -->
          <div v-if="iinError" class="text-red-500 text-sm mt-2 text-center">
            {{ iinError }}
          </div>
        </div>

        <!-- Клавиатура -->
        <div class="grid grid-cols-3 gap-3 w-full mb-4 mt-6">
          <div
            v-for="n in numbers"
            :key="n"
            @click="addDigit(n)"
            class="bg-[#E8F4F2] hover:bg-green-200 py-3 rounded-xl text-lg text-center cursor-pointer text-black font-bold"
          >
            {{ n }}
          </div>

          <div
            class="bg-gray-200 py-3 rounded-xl text-lg flex items-center justify-center cursor-pointer"
            @click="backspace"
          >
            <img src="../assets/remove.svg" alt="backspace" class="w-5 sm:w-6 h-5 sm:h-6" />
          </div>

          <div
            class="bg-[#E8F4F2] hover:bg-green-200 py-3 rounded-xl text-lg text-center cursor-pointer text-black font-bold"
            @click="addDigit('0')"
          >
            0
          </div>

          <div
            class="bg-[#11AE78] text-white py-3 rounded-xl text-lg flex items-center justify-center cursor-pointer"
            @click="authorize"
          >
            <img src="../assets/approve.svg" alt="check" class="w-5 sm:w-6 h-5 sm:h-6" />
          </div>
        </div>

        <!-- Кнопка авторизации -->
        <div
          class="bg-[#0C593E] approve-btn text-white font-bold my-4 px-20 sm:px-18 py-4 rounded-3xl shadow-lg hover:bg-[#0A4A32] text-center cursor-pointer text-base sm:text-lg max-w-md mx-auto transition-all duration-200"
          @click="authorize"
        >
          {{ $t('authorize_button') }}
        </div>

        <span class="text-xs text-gray-500 mt-3 text-center" v-html="$t('data_protection')">
        </span>
      </div>
    </main>

    <FooterNav :showLanguageButton="true" />
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "../store/index";
import FooterNav from "../components/FooterNav.vue";
import UnifiedVideo from "../components/UnifiedVideo.vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();
const router = useRouter();

// Состояние глобальной анимации
const isGlobalAnimating = ref(true); // Начинаем со скрытого состояния

onMounted(() => {
  // Убираем задержку - видео появляется сразу
  isGlobalAnimating.value = false;

  // Дополнительная гарантия скрытия глобального видео
  setTimeout(() => {
    (window as any).forceHideGlobalVideo?.();
  }, 200); // Минимальная задержка для гарантии
});

const userStore = useUserStore();

const iin = ref("");
const iinError = ref("");
const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const addDigit = (digit: string) => {
  if (iin.value.length < 12) {
    iin.value += digit;
    // Очищаем ошибку при вводе
    if (iinError.value) {
      iinError.value = "";
    }
  }
};

const backspace = () => {
  iin.value = iin.value.slice(0, -1);
  // Очищаем ошибку при удалении
  if (iinError.value) {
    iinError.value = "";
  }
};

const multiply = (iin: string, weights: number[]): number => {
  let result = 0;
  for (let i = 0; i < Math.min(iin.length, weights.length); i++) {
    result += parseInt(iin[i]) * weights[i];
  }
  return result;
};

const validateIin = () => {
  if (iin.value.length === 0) {
    iinError.value = $t('auth_error_empty');
    return false;
  } else if (iin.value.length < 12) {
    iinError.value = $t('auth_error_short');
    return false;
  } else if (iin.value.length > 12) {
    iinError.value = $t('auth_error_long');
    return false;
  } else if (!/^\d{12}$/.test(iin.value)) {
    iinError.value = $t('auth_error_invalid');
    return false;
  }
  
  // Проверка контрольной суммы ИИН
  const w1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const w2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
  
  let checkSum = multiply(iin.value, w1) % 11;
  if (checkSum === 10) {
    checkSum = multiply(iin.value, w2) % 11;
  }
  
  if (checkSum !== parseInt(iin.value[11])) {
    iinError.value = $t('auth_error_incorrect');
    return false;
  }
  
  return true;
};

const authorize = () => {
  if (validateIin()) {
    userStore.setIin(iin.value);
    router.back();
  }
  // Если валидация не прошла, ошибка уже показана в validateIin()
};
</script>

<style scoped>
/* Улучшенная видимость для поля ввода ИИН */
input[type="text"] {
  color: #000000 !important;
  font-weight: bold !important;
  font-size: 1.5rem !important;
  letter-spacing: 0.1em !important;
  background-color: #E5E7EB !important;
  border: none !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
}

/* Дополнительные стили для лучшей видимости */
input:focus {
  outline: none !important;
  box-shadow: 0 0 0 3px rgba(17, 174, 120, 0.2) !important;
}

/* Улучшенная видимость цифр на клавиатуре */
.grid > div {
  font-weight: bold !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
}

/* Скрытие видео во время глобальной анимации */
.hidden-during-animation {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-in-out;
}
</style>
