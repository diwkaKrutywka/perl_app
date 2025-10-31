import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.ts'
import i18n from './locales/index'
import Antd from 'ant-design-vue'
import { createPinia } from 'pinia'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

import 'ant-design-vue/dist/reset.css'
import './assets/global.css'

// Настройка dayjs для русского языка
dayjs.locale('ru')

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(i18n)
app.use(Antd)
app.use(pinia)

// Монтируем приложение
app.mount('#app')
