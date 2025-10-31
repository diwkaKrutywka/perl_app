<template>
  <div 
    class="video-wrapper"
    :class="{
      'video-center': position === 'center',
      'video-top-right': position === 'top-right',
      'video-chat': position === 'chat'
    }"
  >
    <div
      class="video-container rounded-full border overflow-hidden shadow-lg bg-white"
      :class="{
        'w-50 h-50 sm:w-74 sm:h-74 lg:w-84 lg:h-84 xl:w-86 xl:h-86 border-2 sm:border-4 border-[#E8F4F2]': position === 'center',
        'w-[calc(5rem+10px)] h-[calc(5rem+10px)] sm:w-[calc(6rem+10px)] sm:h-[calc(6rem+10px)] lg:w-[calc(7rem+10px)] lg:h-[calc(7rem+10px)] border-2 border-[#C5E6DC]': position === 'top-right',
        'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 border-2 border-[#E8F4F2]': position === 'chat'
      }"
    >
      <video
        ref="videoElement"
        :src="finalVideoSrc"
        autoplay
        :muted="!isSoundEnabled"
        :loop="isIdleVideo || pageType === 'main'"
        playsinline
        webkit-playsinline
        preload="auto"
        :class="getVideoClass()"
        :style="getVideoStyle()"
        @loadstart="onVideoLoadStart"
        @loadeddata="onVideoLoadedData"
        @canplay="onVideoCanPlay"
        @error="onVideoError"
        @click="onVideoClick"
        @ended="onVideoEnded"
      ></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useSoundControl } from '../composables/useSoundControl'
import { useVideoRotation } from '../composables/useVideoRotation.ts'

interface Props {
  position: 'center' | 'top-right' | 'chat'
  enableRotation?: boolean
  specificVideo?: string
  instanceId?: string
  pageType?: string
}

const props = withDefaults(defineProps<Props>(), {
  enableRotation: true,
  specificVideo: '',
  instanceId: '',
  pageType: ''
})

const { isSoundEnabled } = useSoundControl()
const { currentVideoSrc, isIdleVideo, setSpecificVideo, switchToIdle } = useVideoRotation(props.instanceId, props.pageType)
const videoElement = ref<HTMLVideoElement>()

// Используем конкретное видео если указано, иначе ротацию
const finalVideoSrc = computed(() => {
  if (props.specificVideo) {
    return props.specificVideo
  }
  return currentVideoSrc.value
})

// Следим за изменениями состояния звука и обновляем видео
watch(isSoundEnabled, (newValue) => {
  if (videoElement.value) {
    videoElement.value.muted = !newValue
  }
})

// Следим за изменениями видео источника
watch(finalVideoSrc, (newSrc) => {
  if (videoElement.value && newSrc) {
    videoElement.value.src = newSrc
    videoElement.value.load()
    
    // Пытаемся запустить воспроизведение после загрузки
    videoElement.value.addEventListener('canplay', () => {
      videoElement.value?.play().catch(() => {
        // Обработка ошибки воспроизведения
      })
    }, { once: true })
    
    // Дополнительная попытка через небольшую задержку
    setTimeout(() => {
      if (videoElement.value && videoElement.value.paused) {
        videoElement.value.play().catch(() => {
          // Обработка ошибки воспроизведения
        })
      }
    }, 200)
    
    // Специальная логика для главной страницы - агрессивный запуск
    if (props.pageType === 'main') {
      const forcePlayMain = () => {
        if (videoElement.value && videoElement.value.paused) {
          videoElement.value.currentTime = 0
          videoElement.value.play().catch(() => {
            // Обработка ошибки воспроизведения
          })
        }
      }
      
      // Множественные попытки запуска
      setTimeout(forcePlayMain, 100)
      setTimeout(forcePlayMain, 300)
      setTimeout(forcePlayMain, 500)
      setTimeout(forcePlayMain, 1000)
      setTimeout(forcePlayMain, 2000)
    }
  }
})

const getVideoClass = () => {
  switch (props.position) {
    case 'center':
      return 'w-full h-full object-cover'
    case 'top-right':
      return 'object-cover'
    case 'chat':
      return 'w-[110%] h-[110%] rounded-full'
    default:
      return 'w-full h-full object-cover'
  }
}

const getVideoStyle = () => {
  switch (props.position) {
    case 'center':
      return 'object-fit: cover; object-position: center; filter: contrast(1.1) brightness(1.05) saturate(1.1) sharpen(0.5);'
    case 'top-right':
      return 'width: 105%; height: 105%; margin: -2.5% 0 0 -2.5%; object-fit: cover; object-position: center; filter: contrast(1.1) brightness(1.05) saturate(1.1) sharpen(0.5);'
    case 'chat':
      return 'margin: -5% 0 0 -5%; object-fit: cover; object-position: center; filter: contrast(1.2) brightness(1.15) saturate(1.2) sharpen(1.0); image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;'
    default:
      return 'object-fit: cover; object-position: center;'
  }
}

const onVideoLoadStart = () => {
  // Видео начало загрузки
}

const onVideoLoadedData = () => {
  // Пытаемся запустить воспроизведение сразу после загрузки данных
  if (videoElement.value && videoElement.value.paused) {
    videoElement.value.play().catch(() => {
      // Обработка ошибки воспроизведения
    })
  }
  
  
  // Специальная логика для главной страницы
  if (props.pageType === 'main') {
    // Принудительно запускаем видео для главной страницы
    setTimeout(() => {
      if (videoElement.value && videoElement.value.paused) {
        videoElement.value.currentTime = 0
        videoElement.value.play().catch(() => {
          // Обработка ошибки воспроизведения
        })
      }
    }, 50)
  }
}

const onVideoCanPlay = () => {
  // Пытаемся запустить воспроизведение сразу после готовности
  if (videoElement.value && videoElement.value.paused) {
    videoElement.value.play().catch(() => {
      // Обработка ошибки воспроизведения
    })
  }
  
  
  // Специальная логика для главной страницы
  if (props.pageType === 'main') {
    // Принудительно запускаем видео для главной страницы
    setTimeout(() => {
      if (videoElement.value && videoElement.value.paused) {
        videoElement.value.currentTime = 0
        videoElement.value.play().catch(() => {
          // Обработка ошибки воспроизведения
        })
      }
    }, 50)
  }
}

const onVideoError = () => {
  // Обработка ошибки загрузки видео
}

const onVideoClick = () => {
  if (videoElement.value) {
    // Для главной страницы принудительно перезапускаем видео
    if (props.pageType === 'main') {
      videoElement.value.currentTime = 0
    }
    videoElement.value.muted = !isSoundEnabled.value
    videoElement.value.play().catch(console.error)
    
    // Дополнительная попытка через небольшую задержку
    setTimeout(() => {
      if (videoElement.value && videoElement.value.paused) {
        videoElement.value.muted = !isSoundEnabled.value
        videoElement.value.play().catch(() => {
          // Обработка ошибки воспроизведения
        })
      }
    }, 100)
  }
}

const onVideoEnded = () => {
  // Если это разговорное видео (не idle) и включена ротация, переключаемся на idle
  if (props.enableRotation && !props.specificVideo && switchToIdle) {
    switchToIdle()
  }
  
  // Для главной страницы (main) перезапускаем idle видео
  if (props.pageType === 'main' && isIdleVideo.value) {
    // Принудительно перезапускаем idle видео
    if (videoElement.value) {
      videoElement.value.currentTime = 0
      videoElement.value.play().catch(() => {
        // Обработка ошибки воспроизведения
      })
    }
  }
}


watch(finalVideoSrc, () => {
  // Видео источник изменился
}, { immediate: true })

// Отслеживаем изменения isIdleVideo для принудительного запуска
watch(isIdleVideo, (newValue) => {
  if (newValue && videoElement.value) {
    // Если видео стало idle, принудительно запускаем воспроизведение
    setTimeout(() => {
      if (videoElement.value && videoElement.value.paused) {
        videoElement.value.play().catch(() => {
          // Обработка ошибки автовоспроизведения
        })
      }
    }, 100)
  }
})

// Специальный watcher для главной страницы - отслеживаем состояние видео
watch(() => props.pageType, (newPageType) => {
  if (newPageType === 'main' && videoElement.value) {
    const forcePlayMainVideo = () => {
      if (videoElement.value && videoElement.value.paused) {
        videoElement.value.currentTime = 0
        videoElement.value.play().catch(() => {
          // Обработка ошибки воспроизведения
        })
      }
    }
    
    // Агрессивный запуск для главной страницы
    forcePlayMainVideo()
    setTimeout(forcePlayMainVideo, 100)
    setTimeout(forcePlayMainVideo, 500)
    setTimeout(forcePlayMainVideo, 1000)
    setTimeout(forcePlayMainVideo, 2000)
    setTimeout(forcePlayMainVideo, 5000)
  }
}, { immediate: true })

onMounted(() => {
  if (videoElement.value) {
    // Устанавливаем muted в зависимости от состояния звука
    videoElement.value.muted = !isSoundEnabled.value
    
    // Принудительно запускаем воспроизведение
    videoElement.value.play().catch(() => {
      // Обработка ошибки автовоспроизведения
    })
    
    // Дополнительные попытки запуска для главной страницы
    if (props.pageType === 'main') {
      const forcePlay = () => {
        if (videoElement.value && videoElement.value.paused) {
          videoElement.value.currentTime = 0
          videoElement.value.muted = !isSoundEnabled.value
          videoElement.value.play().catch(() => {
            // Обработка ошибки воспроизведения
          })
        }
      }
      
      // Множественные попытки с разными интервалами
      setTimeout(forcePlay, 100)
      setTimeout(forcePlay, 300)
      setTimeout(forcePlay, 500)
      setTimeout(forcePlay, 1000)
      setTimeout(forcePlay, 2000)
      setTimeout(forcePlay, 5000)
      
      // Периодическая проверка каждые 2 секунды
      const checkInterval = setInterval(() => {
        if (videoElement.value && videoElement.value.paused) {
          forcePlay()
        }
      }, 2000)
      
      // Очищаем интервал при размонтировании
      onUnmounted(() => {
        clearInterval(checkInterval)
      })
    }
  }
  
  // Если указано конкретное видео, используем его и отключаем ротацию
  if (props.specificVideo) {
    setSpecificVideo(props.specificVideo)
  } else if (props.enableRotation) {
    // Включена ротация видео
  }
  
  // Специальная логика для главной страницы - принудительный запуск
  if (props.pageType === 'main') {

    // Множественные попытки запуска для главной страницы
    const forcePlayMainVideo = () => {
      if (videoElement.value && videoElement.value.paused) {
        videoElement.value.currentTime = 0
        videoElement.value.play().catch(() => {
          // Обработка ошибки автовоспроизведения
        })
      }
    }
    
    // Немедленная попытка
    forcePlayMainVideo()
    
    // Попытки через разные интервалы
    setTimeout(forcePlayMainVideo, 100)
    setTimeout(forcePlayMainVideo, 500)
    setTimeout(forcePlayMainVideo, 1000)
    setTimeout(forcePlayMainVideo, 2000)
    
    // Периодическая проверка каждые 3 секунды для главной страницы
    const mainVideoInterval = setInterval(() => {
      if (props.pageType === 'main' && videoElement.value && videoElement.value.paused) {
        forcePlayMainVideo()
      }
    }, 3000)
    
    // Очищаем интервал при размонтировании
    onUnmounted(() => {
      clearInterval(mainVideoInterval)
    })
  }
  
  // Дополнительная попытка запуска воспроизведения через небольшую задержку
  setTimeout(() => {
    if (videoElement.value && videoElement.value.paused) {
      videoElement.value.play().catch(() => {
        // Обработка ошибки автовоспроизведения
      })
    }
  }, 500)
  
  // Специальная логика для idle видео - дополнительная попытка запуска
  if (isIdleVideo.value) {
    setTimeout(() => {
      if (videoElement.value && videoElement.value.paused) {
        videoElement.value.play().catch(() => {
          // Обработка ошибки автовоспроизведения для idle видео
        })
      }
    }, 1000)
  }
  
  // Добавляем обработчики для пользовательского взаимодействия
  const handleUserInteraction = () => {
    if (videoElement.value && videoElement.value.paused) {
      videoElement.value.muted = !isSoundEnabled.value
      videoElement.value.play().catch(() => {
        // Обработка ошибки воспроизведения
      })
    }
  }
  
  // Добавляем обработчики для различных событий пользовательского взаимодействия
  document.addEventListener('click', handleUserInteraction, { once: true })
  document.addEventListener('touchstart', handleUserInteraction, { once: true })
  document.addEventListener('keydown', handleUserInteraction, { once: true })
  document.addEventListener('mousemove', handleUserInteraction, { once: true })
  
  // Очищаем обработчики при размонтировании
  onUnmounted(() => {
    document.removeEventListener('click', handleUserInteraction)
    document.removeEventListener('touchstart', handleUserInteraction)
    document.removeEventListener('keydown', handleUserInteraction)
    document.removeEventListener('mousemove', handleUserInteraction)
  })
})
</script>

<style scoped>
.video-wrapper {
  transition: all 0.3s ease-in-out;
}

.video-container {
  animation: pulse-glow 2s infinite;
}

/* Тень для центрального видео */
.video-wrapper.video-center .video-container {
  box-shadow: 0 4px 20px rgba(17, 174, 120, 0.3);
}

/* Тень для видео в навбаре - более мягкая с цветом навбара */
.video-wrapper.video-top-right .video-container {
  box-shadow: 0 4px 15px rgba(197, 230, 220, 0.6), 0 2px 8px rgba(17, 174, 120, 0.1);
}

/* Тень для чата */
.video-wrapper.video-chat .video-container {
  box-shadow: 0 2px 8px rgba(17, 174, 120, 0.2);
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(17, 174, 120, 0.3);
  }
  50% {
    box-shadow: 0 4px 30px rgba(17, 174, 120, 0.5);
  }
}
</style>
