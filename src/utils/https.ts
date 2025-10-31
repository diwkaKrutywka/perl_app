import axios from "axios";
import { notification } from "ant-design-vue";
import config from "../config";
import { useUserStore } from "../store/index";
import router from "../router"; // Добавляем импорт роутера
import { auth } from "../api/login"; // Adjust the path to your ApiApi function
import { decodeUnicodeObject } from "./unicodeDecoder";

// Создание базового инстанса
const Service = axios.create({
  baseURL: config.baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    
    "Authorization": "Api-Key e01791bb.-TW3wfW6SpmQHAU6q_d8sasAsS4fDvTt-rXaU8ft8euUztpUnQQTJRkvVylb9_OOeCuZ2OeLKAcl0xbAFw4jrA",
  },
  responseType: 'json',
  responseEncoding: 'utf8',
});

// 🧩 Request Interceptor: добавляем токен и язык
Service.interceptors.request.use((config) => {
  // Убеждаемся, что данные правильно кодируются
  if (config.data && typeof config.data === 'object') {
    config.data = JSON.stringify(config.data);
  }
  
  // Добавляем правильные заголовки для кодировки
  config.headers.set('Content-Type', 'application/json; charset=utf-8');
  config.headers.set('Accept', 'application/json; charset=utf-8');
  
  return config;
});

// 🔁 Response Interceptor: обработка 401 и рефреш токена
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


Service.interceptors.response.use(
  (response) => {
    // Декодируем Unicode escape-последовательности в ответе
    if (response.data) {
      response.data = decodeUnicodeObject(response.data);
    }
    return response;
  },
  async (error: any) => {
    const userStore = useUserStore();
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      // Если это запрос на refresh токен, то сразу выходим
      if (originalRequest.url?.includes("/refresh")) {
        userStore.logout();
        // Перенаправляем на страницу входа
        window.location.href = "/login";
        return Promise.reject(error);
      }
      if (
        !userStore.refreshToken &&
        router.currentRoute.value.path === "/bp/"
      ) {
        const { agent_id } = router.currentRoute.value.query;

        try {
          const res = await auth("login", { agent_id }, "POST");
          if (res.data.success === true) {
            userStore.setUser(res.data);
            window.location.reload();
          }
        } catch (error) {
          // Обработка ошибки
        }
        return;
      }
      // Если нет refresh токена, то выходим

      if (!userStore.refreshToken) {
        notification.error({
          message: "Сессия истекла. Выполните вход снова.",
        });
        userStore.logout();
        // Перенаправляем на страницу входа
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // Если уже идет процесс обновления токена, добавляем в очередь
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return Service(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `https://api.medcontact.kz/auth/api/v1/auth/refresh`,
          {
            refresh_token: userStore.refreshToken,
          }
        );

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        // Обновляем токены в store
        userStore.accessToken = newAccessToken;
        userStore.refreshToken = newRefreshToken;

        // Сохраняем в localStorage
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return Service(originalRequest);
      } catch (err: any) {
        processQueue(err, null);

        // Если refresh токен тоже недействителен, очищаем стор и перенаправляем на логин
        notification.error({
          message: "Сессия истекла. Выполните вход снова.",
        });
        userStore.logout();
        // Перенаправляем на страницу входа
        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default Service;
