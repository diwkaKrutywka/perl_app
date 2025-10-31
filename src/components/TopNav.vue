<template>
  <div class="fixed top-0 left-0 w-full z-10">
    <nav class="bg-[#E8F4F2] h-16 sm:h-20 lg:h-24 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm w-full">
      <!-- Дата и время -->
      <div class="text-[#11AE78] font-bold text-xl sm:text-2xl lg:text-3xl 4k:text-4xl 4k-plus:text-5xl leading-tight">
        <div>{{ currentTime }}</div>
        <div class="text-[#14865E] text-base sm:text-lg lg:text-xl 4k:text-2xl 4k-plus:text-3xl font-bold">{{ currentDate }}</div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useDateTime } from '../composables/useDataTime.ts'
const { currentDate, currentTime } = useDateTime()
</script>

<style scoped>

</style>